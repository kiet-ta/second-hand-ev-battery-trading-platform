using Application.DTOs;
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
        await _context.Payments.AddAsync(payment);
        return payment;
    }

    public async Task<Payment> CreatePaymentAsync(Payment payment)
    {
        var e = (await _context.Payments.AddAsync(payment)).Entity;
         await _context.SaveChangesAsync();
        return e;
    }

    public async Task AddPaymentDetailsAsync(List<PaymentDetail> details)
    {
        _context.PaymentDetails.AddRange(details);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<PaymentWithDetailsDto>> GetAllPaymentsWithDetailsMappedAsync()
    {
        var query = await (
            from p in _context.Payments
            join pd in _context.PaymentDetails on p.PaymentId equals pd.PaymentId into detailsGroup
            select new
            {
                Payment = p,
                Details = detailsGroup.ToList()
            }
        ).ToListAsync();

        var paymentDtos = query.Select(item => new PaymentWithDetailsDto
        {
            PaymentId = item.Payment.PaymentId,
            OrderCode = item.Payment.OrderCode,
            TotalAmount = item.Payment.TotalAmount,
            Currency = item.Payment.Currency,
            Method = item.Payment.Method,
            Status = item.Payment.Status,
            PaymentType = item.Payment.PaymentType,
            CreatedAt = item.Payment.CreatedAt,
            PaymentDetails = item.Details.Select(pd => new PaymentDetailDto
            {
                UserId = pd.UserId,
                PaymentDetailId = pd.PaymentDetailId,
                OrderId = pd.OrderId,
                ItemId = pd.ItemId,
                Amount = pd.Amount
            }).ToList()
        }).ToList();

        return paymentDtos;
    }

    public async Task<IEnumerable<PaymentWithDetailsDto>> GetPaymentHistoryByRolesAsync(
        int buyerId,
        int? sellerId = null,
        int? managerId = null)
    {
        var query = await (
            from p in _context.Payments
            where p.UserId == buyerId

            join pd in _context.PaymentDetails on p.PaymentId equals pd.PaymentId into detailsGroup

            select new
            {
                Payment = p,
                Details = detailsGroup.Where(pd =>
                    (sellerId.HasValue || managerId.HasValue)
                    ? (sellerId.HasValue && pd.UserId == sellerId.Value) ||
                        (managerId.HasValue && pd.UserId == managerId.Value)
                        : (pd.UserId == buyerId)
                )
                .Select(pd => new PaymentDetailDto
                {
                    UserId = pd.UserId,
                    PaymentDetailId = pd.PaymentDetailId,
                    OrderId = pd.OrderId,
                    ItemId = pd.ItemId,
                    Amount = pd.Amount,
                    CreatedAt = pd.CreatedAt
                })
                .ToList()
            }
        )
        .ToListAsync();

        var paymentDtos = query
            .Where(p => p.Details.Any())
            .Select(item => new PaymentWithDetailsDto
            {
                PaymentId = item.Payment.PaymentId,
                UserId = item.Payment.UserId,
                OrderCode = item.Payment.OrderCode,
                TotalAmount = item.Payment.TotalAmount,
                Currency = item.Payment.Currency,
                Method = item.Payment.Method,
                Status = item.Payment.Status,
                PaymentType = item.Payment.PaymentType,
                CreatedAt = item.Payment.CreatedAt,
                PaymentDetails = item.Details
            })
            .ToList();

        return paymentDtos;
    }

    public async Task<DetailedPaymentHistoryDto> GetTransactionDetailAsync(int userId, int orderId)
    {
        var result = await (
            from p in _context.Payments
            where p.UserId == userId

            join o in _context.Orders on orderId equals o.OrderId
            where o.BuyerId == userId && o.OrderId == orderId

            join pd in _context.PaymentDetails on new { PaymentId = p.PaymentId, OrderId = (int?)o.OrderId } equals new { PaymentId = pd.PaymentId, OrderId = pd.OrderId }

            join oi in _context.OrderItems on new { OrderId = (int?)o.OrderId, ItemId = pd.ItemId } equals new { OrderId = oi.OrderId, ItemId = (int?)oi.ItemId }

            select new { Payment = p, Order = o, Detail = pd, Item = oi }
        ).ToListAsync();

        if (result == null || !result.Any())
        {
            return null;
        }

        var firstItem = result.First();

        var dto = new DetailedPaymentHistoryDto
        {
            PaymentId = firstItem.Payment.PaymentId,
            OrderId = firstItem.Order.OrderId,
            OrderCode = firstItem.Payment.OrderCode,
            TotalAmount = firstItem.Payment.TotalAmount,
            Currency = firstItem.Payment.Currency,
            Method = firstItem.Payment.Method,
            Status = firstItem.Payment.Status,
            OrderStatus = firstItem.Item.Status,
            CreatedAt = firstItem.Payment.CreatedAt,

            ItemDetails = result.Select(r => new ItemTransactionDetailDto
            {
                OrderId = r.Order.OrderId,
                ItemId = r.Detail.ItemId,
                PaymentAmount = r.Detail.Amount,
                Quantity = r.Item.Quantity,
                ItemPrice = r.Item.Price
            }).ToList()
        };

        return dto;
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
                    UserId = d.UserId,
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
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == managerIdToFilter);
        // Execute the LINQ query to aggregate revenue data from the database.
        var query = await _context.WalletTransactions
            .Where(t =>
                // 1. Filter: Only include transactions with the 'Revenue' type.
                t.Type == "Revenue" &&

                // 2. Filter: Only include transactions associated with the specific manager's wallet.
                t.WalletId == wallet.WalletId &&

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