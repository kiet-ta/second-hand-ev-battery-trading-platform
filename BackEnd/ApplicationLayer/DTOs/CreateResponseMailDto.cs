using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateResponseMailDto
    {
        public required int complaintId { get; set; }
        public required string handlingDetails { get; set; }
        public required string ticketLink { get; set; }
        public required string supportEmail { get; set; }
        public required string supportPhone { get; set; }


    }
}
