using Application.IServices;
using Microsoft.AspNetCore.SignalR;
using static Application.DTOs.SignalRDtos.ChatDto;

namespace PresentationLayer.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly IUserContextService _userContext;

        public ChatHub(IChatService chatService, IUserContextService userContext)
        {
            _chatService = chatService;
            _userContext = userContext;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = _userContext.GetCurrentUserId();
                await Groups.AddToGroupAsync(Context.ConnectionId, $"u:{userId}");
                Console.WriteLine($"User {userId} connected to ChatHub with connectionId {Context.ConnectionId}");
                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"OnConnectedAsync error: {ex.Message}");
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = _userContext.GetCurrentUserId();
                Console.WriteLine($"User {userId} disconnected from ChatHub");
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"OnDisconnectedAsync error: {ex.Message}");
            }
        }

        public async Task SendMessage(long cid, long to, string text)
        {
            try
            {
                var from = _userContext.GetCurrentUserId();
                Console.WriteLine($"SendMessage called: cid={cid}, from={from}, to={to}, text={text}");

                var dto = new SendMessageDto(cid, from, to, text);

                // Validate room existence and membership
                var room = await _chatService.GetRoomAsync(cid);
                if (room == null)
                    throw new HubException($"Room {cid} not found");

                if (!room.Members.Contains(from) || !room.Members.Contains(to))
                    throw new HubException("You are not a member of this room");

                // Persist message và nhận về message đã được tạo
                var savedMessage = await _chatService.SendMessageAsync(dto);

                // Tạo DTO để broadcast
                var msgDto = new MessageDto(
                    savedMessage.Id,
                    savedMessage.From,
                    savedMessage.To,
                    savedMessage.Text,
                    savedMessage.CreatedAt
                );

                // Broadcast đến cả 2 users
                await Clients.Group($"u:{to}").SendAsync("ReceiveMessage", cid, msgDto);
                await Clients.Group($"u:{from}").SendAsync("ReceiveMessage", cid, msgDto);

                Console.WriteLine($"Message {savedMessage.Id} broadcasted successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SendMessage error: {ex.Message}");
                throw new HubException($"Failed to send message: {ex.Message}");
            }
        }

        public async Task<IEnumerable<ChatRoomDto>> GetMyRooms()
        {
            try
            {
                var userId = _userContext.GetCurrentUserId();
                var rooms = await _chatService.GetRoomsForUserAsync(userId);
                return rooms;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetMyRooms error: {ex.Message}");
                throw new HubException($"Failed to get rooms: {ex.Message}");
            }
        }

        public async Task<ChatRoomDto?> GetRoomWithMessages(long cid)
        {
            try
            {
                var userId = _userContext.GetCurrentUserId();
                var room = await _chatService.GetRoomAsync(cid);

                if (room == null)
                    throw new HubException($"Room {cid} not found");

                // Verify user là member của room
                if (!room.Members.Contains(userId))
                    throw new HubException("You are not a member of this room");

                return room;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetRoomWithMessages error: {ex.Message}");
                throw new HubException($"Failed to get room: {ex.Message}");
            }
        }
    }
}
