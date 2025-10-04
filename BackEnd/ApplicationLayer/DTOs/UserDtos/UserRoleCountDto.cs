using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDtos
{
    public class UserRoleCountDto
    {
        public string Role { get; set; } = null!;
        public int Count { get; set; }
    }
}
