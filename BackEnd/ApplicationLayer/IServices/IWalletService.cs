using Application.DTOs;

namespace Application.IServices;

public interface IWalletService
{
    Task<WalletDto> GetWalletByUserIdAsync(int userId);

    Task<IEnumerable<WalletTransactionDto>> GetTransactionsByWalletIdAsync(int walletId);

    Task<bool> DepositAsync(int userId, decimal amount);
}