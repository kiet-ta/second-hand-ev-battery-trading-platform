using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class ItemBoughtDto
    {
        // Information Item
        public int ItemId { get; set; }
        public string? ItemType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? Price { get; set; }

        // Information payment
        public int PaymentId { get; set; }
        public long OrderCode { get; set; }
        public decimal TotalAmount { get; set; }
        public string Method { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime? PaymentCreatedAt { get; set; }

        // Information detail EV (if any)
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Version { get; set; }
        public int? Year { get; set; }
        public string? Color { get; set; }
        public int? Mileage { get; set; }
        public string LicenseUrl { get; set; }

        // Information detail Battery (if any)
        public int? Capacity { get; set; }
        public decimal? Voltage { get; set; }
        public int? ChargeCycles { get; set; }

        // Amount of item
        public decimal ItemAmount { get; set; }

        public List<ItemImage>? ItemImage { get; set; }
    }
}
