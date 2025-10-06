using Application.IRepositories.IBiddingRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WalletTransactionRepository : IWalletTransactionRepository
{
    private readonly AppDbContext _context;

    public WalletTransactionRepository(AppDbContext db) => _context = db;

    public async Task<int> CreateTransactionAsync(WalletTransaction walletTransaction)
    {
        var e = (await _context.WalletTransactions.AddAsync(walletTransaction)).Entity;
        await _context.SaveChangesAsync();
        return e.TransactionId;
    }

    public async Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId) =>
        await _context.WalletTransactions
            .Where(t => t.WalletId == walletId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
}