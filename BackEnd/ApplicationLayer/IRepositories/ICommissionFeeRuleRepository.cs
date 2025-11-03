using Domain.Entities;

namespace Application.IRepositories;

public interface ICommissionFeeRuleRepository
{
    Task<IEnumerable<CommissionFeeRule>> GetAllAsync();

    Task<CommissionFeeRule?> GetByIdAsync(int id);

    Task AddAsync(CommissionFeeRule rule);

    Task UpdateAsync(CommissionFeeRule rule);

    Task DeleteAsync(int id);

    Task<CommissionFeeRule?> GetActiveRuleByCodeAsync(string feeCode);
}