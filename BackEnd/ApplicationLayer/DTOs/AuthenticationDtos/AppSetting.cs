using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AuthenticationDtos
{
    public class AppSetting
    {
        public string SecretKey { get; set; } = null!;
        public string GoogleClientId { get; set; } = null!;
        public string GoogleClientSecret { get; set; } = null!;
    }
}
