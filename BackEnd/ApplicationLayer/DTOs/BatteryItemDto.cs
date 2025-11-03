using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class BatteryItemDto
    {
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public string? Brand { get; set; }
        public int? Capacity { get; set; }
        public decimal? Voltage { get; set; }
        public int? ChargeCycles { get; set; }
        public decimal? ListedPrice { get; set; }
        public decimal? ActualPrice { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Status { get; set; }

        public DateTime CreatedAt { get; set; } 
        public DateTime SoldAt { get; set; }  
        //public int TotalDays => (SoldAt - CreatedAt).Days;

        public string? ImageUrl { get; set; }
        public BuyerDto? Buyer { get; set; }
        public int? OrderId { get; set; }
    }
}
