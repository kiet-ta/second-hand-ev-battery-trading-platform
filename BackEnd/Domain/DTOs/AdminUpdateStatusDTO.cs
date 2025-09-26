using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTOs
{
    public class AdminUpdateStatusDTO
    {
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
