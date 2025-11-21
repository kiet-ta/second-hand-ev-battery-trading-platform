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
        // markup was modified
        _context.Entry(wallet).State = EntityState.Modified;
    }

    public async Task AddAsync(Wallet wallet)
    {
        await _context.Wallets.AddAsync(wallet);
    }

    public async Task<bool> UpdateBalanceAsync(int walletId, decimal amountChange)
    {
        var wallet = await _context.Wallets.FindAsync(walletId);
        if (wallet == null) return false;

        if (amountChange < 0 && (wallet.Balance < -amountChange))
        {
            return false; 
        }

        wallet.Balance += amountChange;
        wallet.UpdatedAt = DateTime.Now;
        _context.Wallets.Update(wallet);
        return true;
    }

    public async Task AddWalletTransactionAsync(WalletTransaction transaction)
    {
        await _context.WalletTransactions.AddAsync(transaction);
        await _context.SaveChangesAsync();
    }
    public async Task<bool> UpdateBalanceAndHeldAsync(int walletId, decimal balanceChange, decimal heldChange)
    {
        var wallet = await _context.Wallets.FindAsync(walletId);
        if (wallet == null)
        {
            return false;
        }

        // Check available balance (important when making a deposit)
        if (balanceChange < 0 && (wallet.Balance - wallet.HeldBalance) < -balanceChange)
        {
            return false; // Insufficient available balance
        }

        // Check when refunding (heldChange is negative)
        if (heldChange < 0 && (wallet.HeldBalance < -heldChange))
        {
            return false; // Logic error: trying to release more than the amount held
        }

        // Apply changes
        wallet.Balance += balanceChange;
        wallet.HeldBalance += heldChange;
        wallet.UpdatedAt = DateTime.Now;

        // Notify UnitOfWork
        _context.Wallets.Update(wallet);

        return true;
    }
}