using Application.DTOs;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services;

public class WalletService : IWalletService
{
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;

    public WalletService(IWalletRepository walletRepository, IWalletTransactionRepository walletTransactionRepository)
    {
        _walletRepository = walletRepository;
        _walletTransactionRepository = walletTransactionRepository;
    }

    public async Task<WalletDto> GetWalletByUserIdAsync(int userId)
    {
        var wallet = await _walletRepository.GetWalletByUserIdAsync(userId);
        if (wallet == null)
        {
            return null;
        }

        return new WalletDto
        {
            WalletId = wallet.WalletId,
            Balance = wallet.Balance,
            Currency = wallet.Currency,
            Status = wallet.Status
        };
    }

    public async Task<IEnumerable<WalletTransactionDto>> GetTransactionsByWalletIdAsync(int walletId)
    {
        var transactions = await _walletTransactionRepository.GetTransactionsByWalletIdAsync(walletId);

        // Map danh sách Transaction entities sang DTOs
        return transactions.Select(t => new WalletTransactionDto
        {
            TransactionId = t.TransactionId,
            Amount = t.Amount,
            Type = t.Type,
            ReferenceId = t.RefId,
            CreatedAt = t.CreatedAt
        }).ToList();
    }

    public async Task<bool> DepositAsync(int userId, decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Deposit amount must be greater than 0");
        }

        var wallet = await _walletRepository.GetWalletByUserIdAsync(userId);
        if (wallet == null)
        {
            throw new KeyNotFoundException("User wallet not found");
        }

        var success = await _walletRepository.UpdateBalanceAsync(wallet.WalletId, amount);
        if (!success) return false;

        var transaction = new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = amount,
            Type = "deposit",
            CreatedAt = DateTime.Now
        };
        await _walletTransactionRepository.CreateTransactionAsync(transaction);

        return true;
    }
}