using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories.IChatRepositories
{
    public interface IChatRepository
    {
        Task<ChatRoom?> GetRoomRawAsync(long cid);
        Task SaveRoomRawAsync(ChatRoom room);
        Task AppendMessageAsync(long cid, Message message);
        Task<IEnumerable<Message>> GetMessagesAsync(long cid, int limit = 50);
        Task<IEnumerable<ChatRoom>> QueryRoomsByMemberAsync(long memberId);

        Task<IEnumerable<long>> GetRoomIdsByUserIdAsync(long userId);

        Task<Message?> GetLastMessageAsync(long cid);
    }
}
