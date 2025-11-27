using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.IRepositories.IBiddingRepositories;

public interface IWalletTransactionRepository
{
    Task<int> CreateTransactionAsync(WalletTransaction walletTransaction);
    Task AddAsync(WalletTransaction transaction);

    Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId);

    Task<bool> HasTransactionOfTypeWithRefIdAsync(string transactionType, int? refId);
    Task<WalletTransaction?> FindHoldTransactionByRefIdAsync(int bidId);

    Task<WalletTransaction?> GetByOrderItemIdAsync(int orderId);

    Task<WalletTransaction?> GetTransactionByAuctionIdAndTypeAsync(int auctionId, string type);
}