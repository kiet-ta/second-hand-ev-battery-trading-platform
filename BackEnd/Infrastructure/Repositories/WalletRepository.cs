using Application.IRepositories.IBiddingRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WalletRepository : IWalletRepository
{
    private readonly EvBatteryTradingContext _context;

    public WalletRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<Wallet?> GetWalletByUserIdAsync(int? userId) =>
            await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

    public async Task<Wallet> GetManagerWalletAsync()
    {
        const int MANAGER_USER_ID = 4;

        var managerWallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == MANAGER_USER_ID);

        if (managerWallet == null)
        {
            throw new InvalidOperationException("Không tìm thấy ví của Manager hệ thống.");
        }
        return managerWallet;
    }

    public void Update(Wallet wallet)
    {
        // Đánh dấu là đã chỉnh sửa
        _context.Entry(wallet).State = EntityState.Modified;
    }

    public async Task AddAsync(Wallet wallet)
    {
        await _context.Wallets.AddAsync(wallet);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UpdateBalanceAsync(int walletId, decimal amountChange)
    {
         var affectedRows = await _context.Wallets
             .Where(w => w.WalletId == walletId)
             .ExecuteUpdateAsync(updates => updates
                 .SetProperty(w => w.Balance, w => w.Balance + amountChange)
                 .SetProperty(w => w.UpdatedAt, DateTime.UtcNow));
        return affectedRows > 0;
    }

    public async Task AddWalletTransactionAsync(WalletTransaction transaction)
    {
        await _context.WalletTransactions.AddAsync(transaction);
        await _context.SaveChangesAsync();
    }
    public async Task<bool> UpdateBalanceAndHeldAsync(int walletId, decimal balanceChange, decimal heldChange)
    {
        // using ExecuteUpdateAsync to ensure atomic and performance
        var affectedRows = await _context.Wallets
            .Where(w => w.WalletId == walletId)
            // Ensure sufficient available balance if deducting money
            .Where(w => balanceChange >= 0 || (w.Balance - w.HeldBalance) >= -balanceChange)
            .ExecuteUpdateAsync(updates => updates
                .SetProperty(w => w.Balance, w => w.Balance + balanceChange)
                .SetProperty(w => w.HeldBalance, w => w.HeldBalance + heldChange) // update held balance
                .SetProperty(w => w.UpdatedAt, DateTime.UtcNow)); // update timestamp

        return affectedRows > 0;
    }
}