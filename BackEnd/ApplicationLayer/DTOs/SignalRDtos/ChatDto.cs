using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.SignalRDtos
{
    public class ChatDto
    {
        public record CreateRoomDto(long[] Members);
        public record SendMessageDto(long Cid, long From, long To, string Text);
        public record ChatRoomDto(long Cid, long[] Members, MessageDto[] Messages);
        public record MessageDto(string Id, long From, long To, string Text, DateTimeOffset CreatedAt);
    }
}
