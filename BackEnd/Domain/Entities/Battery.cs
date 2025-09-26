using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Battery
{
    public int BatteryId { get; set; }
    
    public int OwnerId { get; set; }

    public decimal? CapacityKWh { get; set; }

    public string? Brand { get; set; }

    public int? Year { get; set; }

    public string? Status { get; set; }

    public decimal? PriceSuggested { get; set; }

    public string? ImagesUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ExternalUser Owner { get; set; } = null!;
}
