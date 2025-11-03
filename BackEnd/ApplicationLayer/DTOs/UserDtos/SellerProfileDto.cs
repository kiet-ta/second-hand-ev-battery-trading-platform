using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDtos
{
    public class SellerProfileDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Avatar { get; set; } = null!;
        public string? Bio { get; set; }
        public DateTime? CreatedAt { get; set; }
        public double Rating { get; set; }
        public int TotalProducts { get; set; }
        public int TotalReviews { get; set; }
    }
}
