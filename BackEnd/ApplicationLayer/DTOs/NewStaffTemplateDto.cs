using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class NewStaffTemplateDto
    {
        public required string To { get; set; }
        public string ActionUrl { get; set; } = "#";
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; }
        public string LogoUrl { get; set; }

    }
}
