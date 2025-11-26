using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Order
{
    public int OrderId { get; set; }

    public int BuyerId { get; set; }

    public int AddressId { get; set; }

    public decimal ShippingPrice { get; set; }


    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
