namespace Application.DTOs.PaymentDtos;

public class PaymentCancelRequestDto
{
    public int orderId { get; set; }

    public string Reason { get; set; } = string.Empty;
}