using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Wallet
{
    public int WalletId { get; set; }

    public int UserId { get; set; }

    public decimal Balance { get; set; }

    public string? Currency { get; set; }

    public string? Status { get; set; }

    public DateTime? UpdatedAt { get; set; }

}
