using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Order
{
    public int OrderId { get; set; }

    public int BuyerId { get; set; }

    public int AddressId { get; set; }

    public string? Status { get; set; }

    public DateOnly CreatedAt { get; set; }

    public DateOnly? UpdatedAt { get; set; }

}
