using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class WalletTransaction
{
    public int TransactionId { get; set; }

    public int WalletId { get; set; }

    public decimal Amount { get; set; }

    public string Type { get; set; } = null!;

    public int? RefId { get; set; }
    public int? AuctionId { get; set; }  // connect with AuctionId if transaction hold/release/payment
    public int? OrderId { get; set; } 
    public DateTime? CreatedAt { get; set; }

}
