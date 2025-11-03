using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class PaymentDetail
{
    public int PaymentDetailId { get; set; }

    public int PaymentId { get; set; }

    public int? OrderId { get; set; }

    public int? ItemId { get; set; }

    public decimal Amount { get; set; }

}
