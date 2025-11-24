using Application.IRepositories.IBiddingRepositories;
using Domain.Common.Constants;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WalletTransactionRepository : IWalletTransactionRepository
{
    private readonly EvBatteryTradingContext _context;

    public WalletTransactionRepository(EvBatteryTradingContext db) => _context = db;

    public async Task<int> CreateTransactionAsync(WalletTransaction walletTransaction)
    {
        var e = (await _context.WalletTransactions.AddAsync(walletTransaction)).Entity;
        await _context.SaveChangesAsync();
        return e.TransactionId;
    }

    public async Task AddAsync(WalletTransaction transaction)
    {
        // Đơn giản là gọi AddAsync của DbContext
        await _context.WalletTransactions.AddAsync(transaction);
    }

    public async Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId) =>
        await _context.WalletTransactions
            .Where(t => t.WalletId == walletId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<bool> HasTransactionOfTypeWithRefIdAsync(string transactionType, int? refId)
    {
        // Ensure refId has a value before querying, as linking transactions without a refId doesn't make sense in this context.
        if (!refId.HasValue)
        {
            return false; // Or throw an ArgumentNullException if refId is mandatory for specific types
        }

        // Check if any transaction exists matching both the type and the RefId
        return await _context.WalletTransactions
            .AnyAsync(wt => wt.Type == transactionType && wt.RefId == refId.Value);
    }
    public async Task<WalletTransaction?> FindHoldTransactionByRefIdAsync(int bidId)
    {
        // Find the only 'hold' transaction associated with this BidId
        return await _context.WalletTransactions
            .Where(wt => wt.Type == WalletTransactionType.Hold.ToString() && wt.RefId == bidId)
            .OrderByDescending(wt => wt.CreatedAt) // ensure to get hold transaction
            .FirstOrDefaultAsync();
    }

    public async Task<WalletTransaction?> GetByOrderItemIdAsync(int orderId)
    {
        var transaction = await _context.WalletTransactions
            .FirstOrDefaultAsync(wt => wt.RefId == orderId);
        if (transaction == null)
        {
            return null;
        }
        return transaction;
    }
}