using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int BuyerId { get; set; }
        public int AddressId { get; set; }
        public string? Status { get; set; }
    }
}
