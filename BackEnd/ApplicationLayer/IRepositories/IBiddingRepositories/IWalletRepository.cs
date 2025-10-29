using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IWalletRepository
{
    Task<Wallet> GetWalletByUserIdAsync(int userId);

    Task<bool> UpdateBalanceAsync(int walletId, decimal amountChange);

    Task AddWalletTransactionAsync(WalletTransaction transaction);
    Task<bool> UpdateBalanceAndHeldAsync(int walletId, decimal balanceChange, decimal heldChange);
}