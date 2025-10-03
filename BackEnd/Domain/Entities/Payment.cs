using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Payment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    public int BuyerId { get; set; }

    public int SellerId { get; set; }

    public string? Method { get; set; }

    public string? Status { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateOnly? UpdatedAt { get; set; }

    //public virtual User Buyer { get; set; } = null!;

    //public virtual Order Order { get; set; } = null!;

    //public virtual User Seller { get; set; } = null!;
}
