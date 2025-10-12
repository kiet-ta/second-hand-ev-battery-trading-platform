using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class OrderItemDto
    {
        public int OrderItemId { get; set; }
        public int? OrderId { get; set; }
        public int BuyerId { get; set; }
        public int ItemId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
