using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.WalletDtos;

public class WithdrawRequestDto
{
    public int UserId { get; set; }
    public string UserRole { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } // withdraw or payment
    public int? RefId { get; set; } //  OrderId or PaymentId
    public int? OrderId { get; set; }
    public int? ItemId { get; set; }
    public string? Description { get; set; }
}
