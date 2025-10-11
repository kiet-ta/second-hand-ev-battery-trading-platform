namespace Application.DTOs;

public class PaymentRequestDto
{
    public int UserId { get; set; }
    public string Method { get; set; }
    public decimal TotalAmount { get; set; }
    public List<PaymentDetailDto> Details { get; set; }
}