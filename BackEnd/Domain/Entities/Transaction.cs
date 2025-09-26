using System;
using System.Collections.Generic;

namespace Domain.Entities;

public partial class Transaction
{
    public int TransactionId { get; set; }

    public int BuyerId { get; set; }

    public int SellerId { get; set; }

    public int ItemId { get; set; }

    public string? Status { get; set; }

    public decimal? Amount { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Buyer { get; set; } = null!;

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    public virtual Item Item { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User Seller { get; set; } = null!;
}
