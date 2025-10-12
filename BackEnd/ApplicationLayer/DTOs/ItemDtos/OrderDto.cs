using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int BuyerId { get; set; }
        public int AddressId { get; set; }
        public string? Status { get; set; }
        public DateOnly CreatedAt { get; set; }
        public DateOnly? UpdatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
