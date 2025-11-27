using Application.DTOs;
using Application.DTOs.WalletDtos;

namespace Application.IServices;

public interface IWalletService
{
    Task<WalletDto> GetWalletByUserIdAsync(int userId);

    Task<IEnumerable<WalletTransactionDto>> GetTransactionsByWalletIdAsync(int walletId);

    Task<bool> DepositAsync(int userId, decimal amount);

    Task<WalletTransactionDto> WithdrawAsync(WithdrawRequestDto request);

    Task<bool> TransferServiceFeeToManagerAsync(int sellerId);

    Task<bool> ProductModerationFeeAsync(int sellerId);

    Task<WalletTransactionDto> RevenueAsync(WithdrawRequestDto request);
}