using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTOs
{
    public class CreateUserDto
    {
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = ""; 
        public string? Gender { get; set; }
        public DateTime? YearOfBirth { get; set; }
        public string? Phone { get; set; }
        public string? AvatarProfile { get; set; }
        public string Role { get; set; } = "Buyer";
    }
}
