using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PurchaseSuccessDto
    {
        public required string To { get; set; }
        public string ActionUrl { get; set; } = "#";

        public string OrderId { get; set; } = string.Empty;
    }
}
