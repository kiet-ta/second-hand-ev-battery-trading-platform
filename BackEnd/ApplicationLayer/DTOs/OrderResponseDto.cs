using Application.DTOs.ItemDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public int BuyerId { get; set; }
        public int AddressId { get; set; }
        public string Status { get; set; }
        public DateOnly CreatedAt { get; set; }
        public IEnumerable<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();

        public bool isDeleted { get; set; }
        }
}
