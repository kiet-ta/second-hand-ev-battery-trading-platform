using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateReportDto
    {
        public int UserId { get; set; }
        public string Type { get; set; }
        public string Reason { get; set; }
        public string? Detail { get; set; }
        
    }
}
