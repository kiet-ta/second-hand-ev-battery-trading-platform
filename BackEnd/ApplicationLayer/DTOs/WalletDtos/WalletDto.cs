namespace Application.DTOs.WalletDtos;

public class WalletDto
{
    public int WalletId { get; set; }
    public decimal Balance { get; set; }
    public string? Currency { get; set; }
    public string? Status { get; set; }
}