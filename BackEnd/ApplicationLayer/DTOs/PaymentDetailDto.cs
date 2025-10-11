namespace Application.DTOs;

public class PaymentDetailDto
{
    public int? OrderId { get; set; }
    public int? ItemId { get; set; }
    public decimal Amount { get; set; }
}