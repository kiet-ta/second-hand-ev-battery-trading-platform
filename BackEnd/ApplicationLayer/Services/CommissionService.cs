using Application.IRepositories;
using Application.IServices;

namespace Application.Services;

public class CommissionService : ICommissionService
{
    private readonly ICommissionFeeRuleRepository _ruleRepo;

    public CommissionService(ICommissionFeeRuleRepository ruleRepo)
    {
        _ruleRepo = ruleRepo;
    }

    public async Task<decimal> CalculateFeeAsync(decimal transactionAmount, string role)
    {
        var rules = await _ruleRepo.GetAllAsync();
        var activeRule = rules
            .FirstOrDefault(r => r.TargetRole == role || r.TargetRole == "All" && r.IsActive);

        if (activeRule == null) return 0;

        return activeRule.FeeType switch
        {
            "percentage" => transactionAmount * activeRule.FeeValue / 100,
            "fixed" => activeRule.FeeValue,
            _ => 0
        };
    }
}