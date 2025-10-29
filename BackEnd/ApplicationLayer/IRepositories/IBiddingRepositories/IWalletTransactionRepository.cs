using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IWalletTransactionRepository
{
    Task<int> CreateTransactionAsync(WalletTransaction walletTransaction);

    Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId);

    Task<bool> HasTransactionOfTypeWithRefIdAsync(string transactionType, int? refId);
    Task<WalletTransaction?> FindHoldTransactionByRefIdAsync(int bidId);
}