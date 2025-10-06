using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class WelcomeDTO
    {
        public required string To { get; set; }
        
        public string ActionUrl { get; set; } = "#";


      
    }
}
