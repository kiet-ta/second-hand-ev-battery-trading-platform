using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AuthenticationDtos
{
    public class TokenRequestDto
    {
        public string Credential { get; set; } = string.Empty;
    }
}
