using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Address
{
    public int AddressId { get; set; }

    public int UserId { get; set; }

    public string RecipientName { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Street { get; set; } = null!;

    public string? Ward { get; set; }

    public string? District { get; set; }

    public string? Province { get; set; }

    public bool? IsDefault { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public bool? IsDeleted { get; set; }

}
