using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class CommissionFeeRule
{
    public int RuleId { get; set; }

    public string FeeCode { get; set; } = null!;

    public string FeeName { get; set; } = null!;

    public string? TargetRole { get; set; }

    public string FeeType { get; set; } = null!;

    public decimal FeeValue { get; set; }

    public DateTime? EffectiveFrom { get; set; }

    public DateTime? EffectiveTo { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

}
