namespace Application.DTOs.PaymentDtos;

public class PaymentDetailDto
{
    public int PaymentDetailId { get; set; }
    public int? OrderId { get; set; }
    public int? ItemId { get; set; }
    public decimal Amount { get; set; }
}