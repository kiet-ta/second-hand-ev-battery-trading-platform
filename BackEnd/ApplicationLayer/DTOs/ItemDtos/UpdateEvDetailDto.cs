using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class UpdateEvDetailDto
    {
        // only updatable fields
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Version { get; set; }
        public int? Year { get; set; }
        public string? BodyStyle { get; set; }
        public string? Color { get; set; }
        public string? LicensePlate { get; set; }
        public bool? HasAccessories { get; set; }
        public int? PreviousOwners { get; set; }
        public bool? IsRegistrationValid { get; set; }
        public int? Mileage { get; set; }

        // optional Item updates
        public string? Title { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public string? Status { get; set; }
    }
}
