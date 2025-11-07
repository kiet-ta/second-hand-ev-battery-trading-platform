using Application.DTOs.ItemDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDtos
{
    public class ItemSellerDto
    {
        public int ItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public string? Status { get; set; }
        
        public string? Moderation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? CategoryName { get; set; } = string.Empty;

        public List<ItemImageDto> Images { get; set; } = new();
    }
}
