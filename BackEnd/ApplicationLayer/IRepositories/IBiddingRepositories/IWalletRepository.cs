using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IWalletRepository
{
    Task<Wallet> GetWalletByUserIdAsync(int userId);

    Task<bool> UpdateBalanceAsync(int walletId, decimal amountChange);
}