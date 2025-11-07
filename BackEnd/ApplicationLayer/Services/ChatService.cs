using Application.DTOs.SignalRDtos;
using Application.IRepositories;
using Application.IRepositories.IChatRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTOs.SignalRDtos.ChatDto;

namespace Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IUserContextService _userContext;
        private readonly IProfanityFilterService _filterService;
        private readonly IUnitOfWork _unitOfWork;


        public ChatService(IUserContextService userContext, IProfanityFilterService filterService, IUnitOfWork unitOfWork)
        {
            _userContext = userContext;
            _filterService = filterService;
            _unitOfWork = unitOfWork;

        }

        public async Task<ChatRoomDto> EnsureRoomAsync(long[] members)
        {
            // Validate
            if (members == null || members.Length != 2)
                throw new ArgumentException("Room must contain exactly 2 members.");

            if (members[0] == members[1])
                throw new ArgumentException("Cannot create room with same user twice.");

            // Create Cid deterministic
            var sorted = members.OrderBy(x => x).ToArray();
            long cid = GenerateCid(sorted);

            Console.WriteLine($"Creating/Getting room with Cid: {cid} for members [{sorted[0]}, {sorted[1]}]");

            // Check room exist 
            var room = await _unitOfWork.Chats.GetRoomRawAsync(cid);

            if (room == null)
            {
                room = new ChatRoom
                {
                    Cid = cid,
                    Members = sorted.ToList()
                };
                await _unitOfWork.Chats.SaveRoomRawAsync(room);
                Console.WriteLine($"Room {cid} created successfully");
            }
            else
            {
                Console.WriteLine($"Room {cid} already exists");
            }

            return new ChatRoomDto(cid, room.Members.ToArray(), Array.Empty<MessageDto>());
        }

        public async Task<Message> SendMessageAsync(SendMessageDto dto)
        {
            // Authorization: current user must be sender
            var current = _userContext.GetCurrentUserId();
            if (current != dto.From)
                throw new UnauthorizedAccessException("You can only send messages as yourself");

            // Validate room exists and user are member
            var room = await _unitOfWork.Chats.GetRoomRawAsync(dto.Cid);
            if (room == null)
                throw new ArgumentException($"Room {dto.Cid} does not exist");

            if (!room.Members.Contains(dto.From) || !room.Members.Contains(dto.To))
                throw new UnauthorizedAccessException("Users must be members of the room");

            //var cleanedMessage = _filterService.CleanMessage(dto.Text);

            var filterResult = _filterService.Filter(dto.Text);
            var cleanedMessage = filterResult.CleanedText;

            // 2. Nếu vi phạm, ghi lại log
            if (filterResult.WasProfane)
            {
                Console.WriteLine($"User {dto.From} sent a profane message.");
                await _unitOfWork.UserModerations.AddProfanityLogAsync(dto.From, DateTimeOffset.UtcNow);

                // 3. (Tùy chọn) Kiểm tra ngay lập tức
                // Bạn có thể lấy count ngay bây giờ để quyết định cấm chat, v.v.
                int profanityCount = await _unitOfWork.UserModerations.GetProfanityCountAsync(dto.From, TimeSpan.FromHours(1));
                Console.WriteLine($"User {dto.From} profanity count in last 1h: {profanityCount}");

                if (profanityCount > 5) // Ví dụ: Cấm chat nếu chửi bậy quá 5 lần/giờ
                {
                    // throw new Exception("Bạn đã bị cấm chat vì vi phạm.");
                }
            }

            // Create message
            var msg = new Message
            {
                Id = Guid.NewGuid().ToString("N"),
                From = dto.From,
                To = dto.To,
                Text = cleanedMessage,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _unitOfWork.Chats.AppendMessageAsync(dto.Cid, msg);
            Console.WriteLine($"Message sent: {msg.Id} from {msg.From} to {msg.To}");

            return msg; // return message to ChatHub able to broadcast
        }

        public async Task<ChatRoomDto?> GetRoomAsync(long cid)
        {
            var room = await _unitOfWork.Chats.GetRoomRawAsync(cid);
            if (room == null) return null;

            // Load messages from Firebase
            var messages = await _unitOfWork.Chats.GetMessagesAsync(cid, limit: 100);
            var messageDtos = messages.Select(m => new MessageDto(
                m.Id,
                m.From,
                m.To,
                m.Text,
                m.CreatedAt
            )).ToArray();

            return new ChatRoomDto(cid, room.Members.ToArray(), messageDtos);
        }

        public async Task<IEnumerable<ChatRoomDto>> GetRoomsForUserAsync(long userId)
        {
            var rooms = await _unitOfWork.Chats.QueryRoomsByMemberAsync(userId);
            return rooms.Select(r => new ChatRoomDto(r.Cid, r.Members.ToArray(), Array.Empty<MessageDto>()));
        }

        public async Task<IEnumerable<MessageDto>> GetMessagesAsync(long cid, int limit = 50)
        {
            var room = await _unitOfWork.Chats.GetRoomRawAsync(cid);
            if (room == null)
                throw new ArgumentException($"Room {cid} does not exist");

            var messages = await _unitOfWork.Chats.GetMessagesAsync(cid, limit);
            return messages.Select(m => new MessageDto(
                m.Id,
                m.From,
                m.To,
                m.Text,
                m.CreatedAt
            )).ToList();
        }

        public async Task<IEnumerable<ChatRoomSummaryDto>> GetRoomsByUserIdAsync(long userId)
        {
            var roomIds = await _unitOfWork.Chats.GetRoomIdsByUserIdAsync(userId);

            var roomTasks = new List<Task<ChatRoomSummaryDto?>>();

            foreach (var cid in roomIds)
            {
                roomTasks.Add(GetRoomSummaryInternalAsync(cid));
            }

            var summaries = await Task.WhenAll(roomTasks);

            return summaries
                .Where(s => s != null)
                .Select(s => s!)
                .OrderByDescending(s => s.LastMessage?.CreatedAt ?? DateTimeOffset.MinValue);
        }

        private async Task<ChatRoomSummaryDto?> GetRoomSummaryInternalAsync(long cid)
        {
            try
            {
                var room = await _unitOfWork.Chats.GetRoomRawAsync(cid);
                if (room == null) return null;

                var lastMessage = await _unitOfWork.Chats.GetLastMessageAsync(cid);

                MessageDto? lastMessageDto = null;
                if (lastMessage != null)
                {
                    lastMessageDto = new MessageDto(
                        lastMessage.Id,
                        lastMessage.From,
                        lastMessage.To,
                        lastMessage.Text,
                        lastMessage.CreatedAt
                    );
                }

                return new ChatRoomSummaryDto(cid, room.Members.ToArray(), lastMessageDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching summary for room {cid}: {ex.Message}");
                return null;
            }
        }

        private long GenerateCid(long[] sortedMembers)
        {
            // Simple deterministic: member1 * 1M + member2
            // Example: users 5 and 10 → 5000010
            // IMPORTANT: Assumes user IDs < 1,000,000
            return (sortedMembers[0] * 1_000_000L) + sortedMembers[1];
        }
    }
}
