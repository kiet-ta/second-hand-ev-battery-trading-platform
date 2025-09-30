using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class OrderItem
{
    public int OrderItemId { get; set; }

    public int OrderId { get; set; }

    public int ItemId { get; set; }

    public int? Quantity { get; set; }

    public decimal? Price { get; set; }

    //public virtual Item Item { get; set; } = null!;

    //public virtual Order Order { get; set; } = null!;
}
