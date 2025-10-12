using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTOs.SignalRDtos.ChatDto;

namespace Application.IServices
{
    public interface IChatService
    {
        Task<ChatRoomDto> EnsureRoomAsync(long[] members);
        Task<Message> SendMessageAsync(SendMessageDto dto); // Changed: return Message
        Task<ChatRoomDto?> GetRoomAsync(long cid);
        Task<IEnumerable<ChatRoomDto>> GetRoomsForUserAsync(long userId);
        Task<IEnumerable<MessageDto>> GetMessagesAsync(long cid, int limit = 50);
    }
}
