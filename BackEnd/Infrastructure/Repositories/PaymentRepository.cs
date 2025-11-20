using Application.DTOs.PaymentDtos;
using Application.IRepositories.IPaymentRepositories;
using Domain.Common.Constants;
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
            payment.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
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

        return await query.AsNoTracking().FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<(int Year, int Month, decimal Total)>> GetRevenueByMonthAsync(int monthsRange)
    {
        // Calculate the start date for the query based on the required range (e.g., 12 months ago).
        var startDate = DateTime.Now.AddMonths(-monthsRange + 1);

        // Hardcoded ID of the manager whose revenue we want to filter.
        int managerIdToFilter = 4;

        // Execute the LINQ query to aggregate revenue data from the database.
        var query = await _context.WalletTransactions
            .Where(t =>
                // 1. Filter: Only include transactions with the 'Revenue' type.
                t.Type == "Revenue" &&

                // 2. Filter: Only include transactions associated with the specific manager's wallet.
                t.WalletId == managerIdToFilter &&

                // 3. Filter: Only include transactions within the defined time range.
                t.CreatedAt >= startDate)

            // Group the filtered transactions by Year and Month.
            .GroupBy(t => new {
                t.CreatedAt.Year,
                t.CreatedAt.Month
            })
            .Select(g => new // Project the results into an anonymous type.
            {
                g.Key.Year,
                g.Key.Month,
                Total = g.Sum(x => x.Amount) // Calculate the sum of 'Amount' for each group (month).
            })
            // Order the results chronologically.
            .OrderBy(g => g.Year)
            .ThenBy(g => g.Month)
            .ToListAsync(); // Execute the query and load results into memory.

        // Return the results as a standard tuple collection.
        return query.Select(q => (q.Year, q.Month, q.Total));
    }
    public async Task<Payment?> GetByOrderIdAsync(int orderId)
    {
        var paymentDetail = await _context.PaymentDetails
            .FirstOrDefaultAsync(pd => pd.OrderId == orderId);

        if (paymentDetail == null) return null;

        return await _context.Payments.FindAsync(paymentDetail.PaymentId);
    }
}