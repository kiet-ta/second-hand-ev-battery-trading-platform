using Application.IRepositories;
using Application.IServices;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CommissionService : ICommissionService
    {
        private readonly ICommissionFeeRuleRepository _ruleRepo;

        public CommissionService(ICommissionFeeRuleRepository ruleRepo)
        {
            _ruleRepo = ruleRepo ?? throw new ArgumentNullException(nameof(ruleRepo));
        }

        public async Task<decimal> CalculateFeeAsync(decimal transactionAmount, string role)
        {
            if (transactionAmount < 0)
                throw new ArgumentException("Transaction amount cannot be negative.", nameof(transactionAmount));

            if (string.IsNullOrWhiteSpace(role))
                throw new ArgumentException("Role cannot be null or empty.", nameof(role));

            var rules = await _ruleRepo.GetAllAsync()
                ?? throw new InvalidOperationException("No commission rules found.");

            var activeRule = rules.FirstOrDefault(r => (r.TargetRole == role || r.TargetRole == "All") && r.IsActive);

            if (activeRule == null)
                throw new InvalidOperationException($"No active commission rule found for role '{role}'.");

            return activeRule.FeeType switch
            {
                "percentage" => transactionAmount * activeRule.FeeValue / 100,
                "fixed" => activeRule.FeeValue,
                _ => throw new InvalidOperationException($"Invalid fee type '{activeRule.FeeType}' in commission rule.")
            };
        }
    }
}
