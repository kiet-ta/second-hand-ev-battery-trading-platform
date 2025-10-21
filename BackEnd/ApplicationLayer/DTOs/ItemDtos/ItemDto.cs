using Application.DTOs.ItemDtos.BatteryDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class ItemDto
    {
        public int ItemId { get; set; }

        public string? ItemType { get; set; }

        public int? CategoryId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public decimal? Price { get; set; }

        public int Quantity { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public int? UpdatedBy { get; set; }

        public string? Moderation { get; set; }


        public List<ItemImageDto>? Images { get; set; } = new();
        public string? SellerName { get; set; }
        public string Status { get; set; } = "active";
        //public bool? IsDeleted { get; set; }
        public object ItemDetail { get; set; }
    }
}
