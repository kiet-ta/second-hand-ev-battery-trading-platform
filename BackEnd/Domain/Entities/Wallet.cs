using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Wallet
{
    public int WalletId { get; set; }

    public int UserId { get; set; }

    public decimal Balance { get; set; }
    public string Currency { get; set; } = "VND";
    public string Status { get; set; } = "ACTIVE";
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
