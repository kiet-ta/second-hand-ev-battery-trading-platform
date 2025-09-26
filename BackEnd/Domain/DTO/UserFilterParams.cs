using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTO
{
    public class UserFilterParams
    {
        public string? Role { get; set; }                      
        public string? AccountStatus { get; set; }    
        public string? Keyword{ get; set; }        
    }

   
}
