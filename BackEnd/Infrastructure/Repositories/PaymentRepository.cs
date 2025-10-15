using Application.DTOs.PaymentDtos;
using Application.IRepositories.IPaymentRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly EvBatteryTradingContext _context;

    public PaymentRepository(EvBatteryTradingContext context)
    {
        _context = context;
    }

    public async Task<Payment> AddPaymentAsync(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();  // Save for generate PaymentId
        return payment;
    }

    public async Task AddPaymentDetailsAsync(List<PaymentDetail> details)
    {
        _context.PaymentDetails.AddRange(details);
        await _context.SaveChangesAsync();
    }

    public async Task UpdatePaymentStatusAsync(int paymentId, string status)
    {
        var payment = await _context.Payments.FindAsync(paymentId);
        if (payment != null)
        {
            payment.Status = status;
            payment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Wallet> GetWalletByUserIdAsync(int userId)
    {
        return await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
    }

    public async Task DeductWalletBalanceAsync(Wallet wallet, decimal amount, int paymentId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            wallet.Balance -= amount;
            wallet.UpdatedAt = DateTime.UtcNow;

            var walletTransaction = new WalletTransaction
            {
                WalletId = wallet.WalletId,
                Amount = -amount,
                Type = "payment",
                RefId = paymentId,
                CreatedAt = DateTime.UtcNow
            };
            _context.WalletTransactions.Add(walletTransaction);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PaymentInfoDto> GetPaymentInfoByOrderCodeAsync(long orderCode)
    {
        var query = _context.Payments
            .GroupJoin(
                _context.PaymentDetails,
                p => p.PaymentId,
                pd => pd.PaymentId,
                (p, detailsGroup) => new { Payment = p, Details = detailsGroup }
            )
            .Where(x => x.Payment.OrderCode == orderCode)
            .Select(x => new PaymentInfoDto
            {
                PaymentId = x.Payment.PaymentId,
                UserId = x.Payment.UserId,
                OrderCode = x.Payment.OrderCode,
                TotalAmount = x.Payment.TotalAmount,
                Method = x.Payment.Method,
                Status = x.Payment.Status,
                CreatedAt = x.Payment.CreatedAt,
                Details = x.Details.Select(d => new PaymentDetailDto
                {
                    OrderId = d.OrderId,
                    ItemId = d.ItemId,
                    Amount = d.Amount
                }).ToList()
            });

        return await query.FirstOrDefaultAsync();
    }

    public async Task UpdateRelatedEntitiesAsync(List<PaymentDetailDto> details)
    {
        foreach (var detail in details)
        {
            if (detail.OrderId.HasValue)
            {
                var order = await _context.Orders.FindAsync(detail.OrderId.Value);
                if (order != null)
                {
                    order.Status = "paid";
                    order.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);
                }
            }
            if (detail.ItemId.HasValue)
            {
                var item = await _context.Items.FindAsync(detail.ItemId.Value);
                if (item != null)
                {
                    item.Status = "sold";
                    item.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}