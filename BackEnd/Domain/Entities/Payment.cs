using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Payment
{
    public int PaymentId { get; set; }

    public int UserId { get; set; }

    public long OrderCode { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Currency { get; set; }

    public string Method { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime? ExpiredAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

}
