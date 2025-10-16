using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Complaint
    {
        public int ComplaintId { get; set; }
        public int? OrderId { get; set; }
        public int BuyerId { get; set; }
        public int SellerId { get; set; }
        public string Reason { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = "pending";
        public string SeverityLevel { get; set; } = "medium";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
