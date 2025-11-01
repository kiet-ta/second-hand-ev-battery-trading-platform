using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTOs.SignalRDtos.ChatDto;

namespace Application.DTOs.SignalRDtos
{
    public class ChatRoomSummaryDto
    {
        public long Cid { get; }
        public long[] Members { get; }
        public MessageDto? LastMessage { get; }

        public ChatRoomSummaryDto(long cid, long[] members, MessageDto? lastMessage)
        {
            Cid = cid;
            Members = members;
            LastMessage = lastMessage;
        }
    }
}
