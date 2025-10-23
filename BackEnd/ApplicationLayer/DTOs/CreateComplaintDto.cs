using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateComplaintDto
    {
        public string Reason { get; set; } = null!;
        public string? Description { get; set; }
        public string Status { get; set; } = "pending";
        public string SeverityLevel { get; set; } = "medium";
        public bool IsDeleted { get; set; }
    }
}
