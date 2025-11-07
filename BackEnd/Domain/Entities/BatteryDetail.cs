using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class BatteryDetail
{
    public int ItemId { get; set; }

    public string? Brand { get; set; }

    public int? Capacity { get; set; }

    public decimal? Voltage { get; set; }

    public int? ChargeCycles { get; set; }
    
    public string Condition { get; set; }

    public DateTime? UpdatedAt { get; set; }

}
