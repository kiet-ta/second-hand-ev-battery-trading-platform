using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ChatRoom
    {
        public long Cid { get; set; }
        public List<long> Members { get; set; } = new();
    }
}
