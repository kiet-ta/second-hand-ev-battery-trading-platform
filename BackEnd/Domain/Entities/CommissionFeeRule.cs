namespace Domain.Entities;

public class CommissionFeeRule
{
    public int RuleId { get; set; }
    public string FeeCode { get; set; } = string.Empty;
    public string FeeName { get; set; } = string.Empty;
    public string TargetRole { get; set; } = "seller";
    public string FeeType { get; set; } = "percentage";
    public decimal FeeValue { get; set; }
    public DateTime EffectiveFrom { get; set; } = DateTime.Now;
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
