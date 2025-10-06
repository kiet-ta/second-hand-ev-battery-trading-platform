namespace Domain.Entities;

public class WalletTransaction
{
    public int TransactionId { get; set; }

    public int WalletId { get; set; }

    public decimal Amount { get; set; }

    public string? Type { get; set; } // deposit, withdraw, hold, release, payment

    public int? RefId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}