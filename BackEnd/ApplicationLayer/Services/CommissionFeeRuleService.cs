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
    private readonly IUnitOfWork _unitOfWork;

    public CommissionFeeRuleService(IUnitOfWork unitOfWork)
    {

        _unitOfWork = unitOfWork;
    }
    public async Task<IEnumerable<CommissionFeeRule>> GetAllAsync() => await _unitOfWork.CommissionFeeRules.GetAllAsync();
    public async Task<CommissionFeeRule?> GetByIdAsync(int id) => await _unitOfWork.CommissionFeeRules.GetByIdAsync(id);
    public async Task AddAsync(CommissionFeeRule rule) => await _unitOfWork.CommissionFeeRules.AddAsync(rule);
    public async Task<CommissionFeeRule> ToggleStatusAsync(CommissionFeeRule rule)
    {
        if (rule == null)
            throw new ArgumentNullException(nameof(rule));
        rule.IsActive = !rule.IsActive;
        await _unitOfWork.CommissionFeeRules.UpdateAsync(rule);
        return rule;
    }
}
