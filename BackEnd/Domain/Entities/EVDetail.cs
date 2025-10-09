using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class EVDetail
{
    public int ItemId { get; set; }

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

    public DateOnly? UpdatedAt { get; set; }

}
