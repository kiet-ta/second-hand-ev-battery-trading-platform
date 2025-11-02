using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using IdGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services;

public class CommissionFeeRuleService : ICommissionFeeRuleService
{
    private readonly ICommissionFeeRuleRepository _repository;

    public CommissionFeeRuleService(ICommissionFeeRuleRepository repository)
    {
        _repository = repository;
    }
    public async Task<IEnumerable<CommissionFeeRule>> GetAllAsync() => await _repository.GetAllAsync();
    public async Task<CommissionFeeRule?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
    public async Task AddAsync(CommissionFeeRule rule) => await _repository.AddAsync(rule);
    public async Task<CommissionFeeRule> ToggleStatusAsync(CommissionFeeRule rule)
    {
        if (rule == null)
            throw new ArgumentNullException(nameof(rule));
        rule.IsActive = !rule.IsActive;
        await _repository.UpdateAsync(rule);
        return rule;
    }
}
