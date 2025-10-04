using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AuthenticationDtos
{
    public class LoginDto
    {
        public string Email { get; set; } = null!;

        public string Password { get; set; } = null!;
    }
}
