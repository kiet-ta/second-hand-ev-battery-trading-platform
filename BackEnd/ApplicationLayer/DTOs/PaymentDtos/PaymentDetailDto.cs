namespace Application.DTOs.PaymentDtos;

public class PaymentDetailDto
{
    public int UserId { get; set; }
    public string UserRole { get; set; }
    public int PaymentDetailId { get; set; }
    public int PaymentId { get; set; }
    public int? OrderId { get; set; }
    public int? ItemId { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}