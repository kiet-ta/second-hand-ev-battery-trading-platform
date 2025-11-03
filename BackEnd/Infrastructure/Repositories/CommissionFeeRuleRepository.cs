using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CommissionFeeRuleRepository : ICommissionFeeRuleRepository
{
    private readonly EvBatteryTradingContext _context;

    public CommissionFeeRuleRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<IEnumerable<CommissionFeeRule>> GetAllAsync() =>
        await _context.CommissionFeeRules.ToListAsync();

    public async Task<CommissionFeeRule?> GetByIdAsync(int id) =>
        await _context.CommissionFeeRules.FindAsync(id);

    public async Task AddAsync(CommissionFeeRule rule)
    {
        _context.CommissionFeeRules.Add(rule);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CommissionFeeRule rule)
    {
        _context.CommissionFeeRules.Update(rule);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var rule = await GetByIdAsync(id);
        if (rule != null)
        {
            rule.IsActive = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<CommissionFeeRule?> GetActiveRuleByCodeAsync(string feeCode)
    {
        return await _context.CommissionFeeRules
            .FirstOrDefaultAsync(r => r.FeeCode == feeCode && r.IsActive == true);
    }
}