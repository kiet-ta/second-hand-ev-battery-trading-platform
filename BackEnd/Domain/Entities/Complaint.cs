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
     public int UserId { get; set; }
        public int? AssignTo { get; set; }
        public string Reason { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = "pending";
        public string SeverityLevel { get; set; } = "medium";
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
