using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateOrderRequestDto
    {
        public int BuyerId { get; set; }
        public int AddressId { get; set; }
        public List<int> OrderItemIds { get; set; } = new();
        public DateOnly CreatedAt { get; set; }
        public DateOnly? UpdatedAt { get; set; }
    }
}
