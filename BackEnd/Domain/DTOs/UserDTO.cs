using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTOs
{
    public class UserDTO
    {
        public string FullName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public string? Gender { get; set; }

        public DateOnly? YearOfBirth { get; set; }

        public string? Phone { get; set; }

        public string Role { get; set; } = null!;

        public string? AccountStatus { get; set; }

        public DateOnly? CreatedAt { get; set; }

        public DateOnly? UpdatedAt { get; set; }

    }
}
