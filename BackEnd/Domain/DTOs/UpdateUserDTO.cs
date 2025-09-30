using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTOs
{
    public class UpdateUserDto
    {
        public string FullName { get; set; } = "";
        public string? Phone { get; set; }
        public string? AvatarProfile { get; set; }
        public string Role { get; set; } = "Buyer";
        public string KycStatus { get; set; } = "not_submitted";
        public string AccountStatus { get; set; } = "active";
    }
}
