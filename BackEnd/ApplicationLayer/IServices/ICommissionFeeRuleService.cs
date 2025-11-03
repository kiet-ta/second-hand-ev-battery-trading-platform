using Domain.Entities;

namespace Application.IServices;

public interface ICommissionFeeRuleService
{
    Task<IEnumerable<CommissionFeeRule>> GetAllAsync();
    Task<CommissionFeeRule?> GetByIdAsync(int id);
    Task AddAsync(CommissionFeeRule rule);
    Task<CommissionFeeRule> ToggleStatusAsync(CommissionFeeRule rule);
}