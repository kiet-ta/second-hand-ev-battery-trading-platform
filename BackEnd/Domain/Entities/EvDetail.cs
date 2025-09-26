using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class EvDetail
{
    public int ItemId { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public int? Year { get; set; }

    public int? Mileage { get; set; }

    public int? BatteryCapacity { get; set; }

    public virtual Item Item { get; set; } = null!;
}
