using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTOs
{
    public class UpdateUserDTO
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        public string? Password { get; set; }
    }


    public class UpdateUserDTOToDB
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        public string? HashPassword { get; set; }
    }
}
