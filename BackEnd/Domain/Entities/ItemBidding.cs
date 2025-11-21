using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ItemBidding
    {
        public int BiddingId { get; set; }

        public int ItemId { get; set; }

        public decimal StartingPrice { get; set; }

        public decimal CurrentPrice { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string Status { get; set; } = "active"; // active, ended, cancelled

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
