using Application.IRepositories.IBiddingRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WalletRepository : IWalletRepository
{
    private readonly EvBatteryTradingContext _context;

    public WalletRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<Wallet> GetWalletByUserIdAsync(int userId) =>
        await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

    public async Task<bool> UpdateBalanceAsync(int walletId, decimal amountChange)
    {
        var wallet = await _context.Wallets.FindAsync(walletId);
        if (wallet == null) return false;

        wallet.Balance += amountChange;

        _context.Wallets.Update(wallet);
        await _context.SaveChangesAsync();
        return true;
    }
}