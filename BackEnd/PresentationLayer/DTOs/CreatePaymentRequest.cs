using Application.DTOs;
using Net.payOS.Types;

namespace PresentationLayer.DTOs;

public class CreatePaymentRequest
{
    public long OrderCode { get; set; }
    public int Amount { get; set; }
    public string Description { get; set; }
    public List<ItemPaymentDTO> Items { get; set; } = new List<ItemPaymentDTO>();
    public string ReturnUrl { get; set; }
    public string CancelUrl { get; set; }
}