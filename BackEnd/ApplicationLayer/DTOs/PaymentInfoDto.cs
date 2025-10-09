namespace Application.DTOs;

public class PaymentInfoDto
{
    public int PaymentId { get; set; }
    public int UserId { get; set; }
    public long OrderCode { get; set; }
    public decimal TotalAmount { get; set; }
    public string Method { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PaymentDetailDto> Details { get; set; } = new List<PaymentDetailDto>();
}