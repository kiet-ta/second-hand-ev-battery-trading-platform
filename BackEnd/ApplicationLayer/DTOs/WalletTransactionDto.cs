namespace Application.DTOs;

public class WalletTransactionDto
{
    public int TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; }
    public int? ReferenceId { get; set; }
    public DateTime? CreatedAt { get; set; }
}