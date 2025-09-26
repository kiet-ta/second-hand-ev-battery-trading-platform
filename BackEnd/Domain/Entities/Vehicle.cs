using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Vehicle
{
    public int VehicleId { get; set; }

    public int OwnerId { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public int? Year { get; set; }

    public int? MileageKm { get; set; }

    public int? BatteryCapacity { get; set; }

    public decimal? PriceSuggested { get; set; }

    public string? ImagesUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ExternalUser Owner { get; set; } = null!;
}
