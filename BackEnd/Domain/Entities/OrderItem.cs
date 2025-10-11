using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class OrderItem
{
    public int OrderItemId { get; set; }

    public int? OrderId { get; set; }

    public int BuyerId { get; set; }

    public int ItemId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public bool? IsDeleted { get; set; }

}
