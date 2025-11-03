using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDtos
{
    public class UpdateUserDto
    {

        public int UserId { get; set; }

        public string FullName { get; set; } = null!;

        public string? Gender { get; set; }

        public DateOnly? YearOfBirth { get; set; }

        public string? Phone { get; set; }

        public string? AvatarProfile { get; set; }

        public string? Bio { get; set; } = null!;

        public DateTime? UpdatedAt { get; set; }
    }
}
