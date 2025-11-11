using Domain.Common.Constants;
using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Wallet
{
    public int WalletId { get; set; }

    public int UserId { get; set; }

    public decimal Balance { get; set; }
    public string Currency { get; set; } = "vnd";
    public decimal HeldBalance { get; set; } = 0;
    public string Status { get; set; } =  WalletStatus.Active.ToString();
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public decimal AvailableBalance => Balance - HeldBalance;
}
