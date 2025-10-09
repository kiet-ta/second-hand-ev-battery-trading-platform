namespace Application.DTOs;

public class PaymentResponseDto
{
    public string CheckoutUrl { get; set; }
    public long OrderCode { get; set; }
    public int PaymentId { get; set; }
    public string Status { get; set; }
}