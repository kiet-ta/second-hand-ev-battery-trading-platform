using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    
    
        public class EVItemDto
        {
            public int ItemId { get; set; }
            public string Title { get; set; }
            public string LicensePlate { get; set; }
            public int? Mileage { get; set; }
            public string Color { get; set; }
            public int? Year { get; set; }
            public decimal? ListedPrice { get; set; }
            public decimal? ActualPrice { get; set; }
            public string? PaymentMethod { get; set; }
            public string? Status { get; set; }

            public DateOnly CreatedAt { get; set; } 
            public DateOnly SoldAt { get; set; }  
            //public int TotalDays => SoldAt.HasValue ? (SoldAt.Value - CreatedAt).Days : 0;

            public string? ImageUrl { get; set; }
            public BuyerDto? Buyer { get; set; }
       }
    

}
