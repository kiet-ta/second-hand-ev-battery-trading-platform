using Domain.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ItemDtos
{
    public class CreateEvDetailDto
    {
        // Item fields
        public int? CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = ItemStatus.Active.ToString();
        public string Moderation { get; set; } = ItemModeration.Not_Submitted.ToString
            ();
        public int? UpdatedBy { get; set; }
        public string LicenseUrl { get; set; }

        // Ev fields
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Version { get; set; }
        public int? Year { get; set; }
        public string? BodyStyle { get; set; }
        public string? Color { get; set; }
        public string? LicensePlate { get; set; }
        public bool HasAccessories { get; set; }
        public int PreviousOwners { get; set; } = 1;
        public bool IsRegistrationValid { get; set; }
        public int? Mileage { get; set; }
    }
}
