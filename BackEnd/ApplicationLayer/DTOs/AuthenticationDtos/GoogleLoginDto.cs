using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AuthenticationDtos
{
    public class GoogleLoginDto
    {
        public string IdToken { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]

        public string? Email { get; set; }

        public string? Device { get; set; }

        public string? ClientIp { get; set; }
        /// <summary>
        /// Firebase Cloud Messaging token (if have push notification).
        /// </summary>
        public string? FcmToken { get; set; }
    }
}
