using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class BatteryItemDTO
    {
        public int ItemId { get; set; }
        public string Brand { get; set; }
        public int? Capacity { get; set; }
        public decimal? Voltage { get; set; }
        public int? ChargeCycles { get; set; }
        public decimal? ListedPrice { get; set; }
        public decimal? ActualPrice { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }

        public DateOnly CreatedAt { get; set; } 
        public DateOnly? SoldAt { get; set; }  
        public int TotalDays => SoldAt.HasValue ? (SoldAt.Value.ToDateTime(TimeOnly.MinValue) - CreatedAt.ToDateTime(TimeOnly.MinValue)).Days : 0;

        public string ImageUrl { get; set; }
        public BuyerDTO Buyer { get; set; }
    }
}
