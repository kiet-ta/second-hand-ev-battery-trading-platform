using Domain.Common.Constants;
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
        public string Status { get; set; } = ComplaintStatus.Pending.ToString();
        public string SeverityLevel { get; set; } = ComplaintSeverityLevel.Medium.ToString();
        public bool IsDeleted { get; set; }
    }
}
