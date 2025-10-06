using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IWalletTransactionRepository
{
    Task<int> CreateTransactionAsync(WalletTransaction walletTransaction);

    Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId);
}