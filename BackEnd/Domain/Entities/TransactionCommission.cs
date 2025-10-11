using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class TransactionCommission
{
    public int Id { get; set; }

    public int TransactionId { get; set; }

    public int RuleId { get; set; }

    public decimal AppliedValue { get; set; }

    public DateTime? CreatedAt { get; set; }

}
