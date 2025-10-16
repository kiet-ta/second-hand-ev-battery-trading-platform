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
        private readonly IChatRepository _repo;
        private readonly IUserContextService _userContext;
        private readonly IProfanityFilterService _filterService;

        public ChatService(IChatRepository repo, IUserContextService userContext, IProfanityFilterService filterService)
        {
            _repo = repo;
            _userContext = userContext;
            _filterService = filterService;
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
            var room = await _repo.GetRoomRawAsync(cid);

            if (room == null)
            {
                room = new ChatRoom
                {
                    Cid = cid,
                    Members = sorted.ToList()
                };
                await _repo.SaveRoomRawAsync(room);
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
            var room = await _repo.GetRoomRawAsync(dto.Cid);
            if (room == null)
                throw new ArgumentException($"Room {dto.Cid} does not exist");

            if (!room.Members.Contains(dto.From) || !room.Members.Contains(dto.To))
                throw new UnauthorizedAccessException("Users must be members of the room");

            var cleanedMessage = _filterService.CleanMessage(dto.Text);

            // Create message
            var msg = new Message
            {
                Id = Guid.NewGuid().ToString("N"),
                From = dto.From,
                To = dto.To,
                Text = cleanedMessage,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repo.AppendMessageAsync(dto.Cid, msg);
            Console.WriteLine($"Message sent: {msg.Id} from {msg.From} to {msg.To}");

            return msg; // return message to ChatHub able to broadcast
        }

        public async Task<ChatRoomDto?> GetRoomAsync(long cid)
        {
            var room = await _repo.GetRoomRawAsync(cid);
            if (room == null) return null;

            // Load messages from Firebase
            var messages = await _repo.GetMessagesAsync(cid, limit: 100);
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
            var rooms = await _repo.QueryRoomsByMemberAsync(userId);
            return rooms.Select(r => new ChatRoomDto(r.Cid, r.Members.ToArray(), Array.Empty<MessageDto>()));
        }

        public async Task<IEnumerable<MessageDto>> GetMessagesAsync(long cid, int limit = 50)
        {
            var room = await _repo.GetRoomRawAsync(cid);
            if (room == null)
                throw new ArgumentException($"Room {cid} does not exist");

            var messages = await _repo.GetMessagesAsync(cid, limit);
            return messages.Select(m => new MessageDto(
                m.Id,
                m.From,
                m.To,
                m.Text,
                m.CreatedAt
            )).ToList();
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
