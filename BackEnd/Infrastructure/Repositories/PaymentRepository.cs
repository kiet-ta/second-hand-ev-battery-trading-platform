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
        var startDate = DateTime.UtcNow.AddMonths(-monthsRange + 1);

        var query = await _context.Payments
            .Where(o => o.Status == "completed" && o.CreatedAt >= startDate)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Total = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(g => g.Year)
            .ThenBy(g => g.Month)
            .ToListAsync();

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