using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class FavoriteItemDto
    {
        public int FavId { get; set; }
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public string Title { get; set; }
        public decimal? Price { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }

        public object ItemDetail { get; set; } // Có thể là EvDetailDto hoặc BatteryDetailDto
        public List<string> ImageUrls { get; set; } = new();
    }
}
