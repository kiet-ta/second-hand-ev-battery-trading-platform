using Application.DTOs;
using Application.DTOs.PaymentDtos;
using Application.IRepositories.IPaymentRepositories;
using Domain.Common.Constants;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PaymentDetailRepository : IPaymentDetailRepository
    {
        private readonly EvBatteryTradingContext _context;

        public PaymentDetailRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task AddPaymentDetailAsync(PaymentDetail obj)
        {
            await _context.PaymentDetails.AddAsync(obj);
        }

public async Task<IEnumerable<UserPaymentDetailHistoryDto>> GetPaymentDetailsByUserIdAsync(int userId)
{
    var query = await (
        from pd in _context.PaymentDetails
        where pd.UserId == userId

        join p in _context.Payments on pd.PaymentId equals p.PaymentId
        
        select new UserPaymentDetailHistoryDto
        {
            // Payment Detail Fields
            PaymentDetailId = pd.PaymentDetailId,
            UserId = pd.UserId,
            PaymentId = pd.PaymentId,
            OrderId = pd.OrderId,
            ItemId = pd.ItemId,
            Amount = pd.Amount,
            CreatedAt = pd.CreatedAt,

            // Payment Fields
            OrderCode = p.OrderCode,
            TotalAmount = p.TotalAmount,
            Currency = p.Currency,
            Method = p.Method,
            Status = p.Status,
            PaymentType = p.PaymentType,
            PaymentCreatedAt = p.CreatedAt // CreatedAt of Payment
        }
    )
    .OrderByDescending(dto => dto.CreatedAt)
    .ToListAsync();

    return query;
}

        public async Task<decimal> GetRevenueAsync(int sellerId)
        {
            // Calculate the total lifetime revenue for a specific seller.
            var totalRevenueQuery = await _context.WalletTransactions
                // Filter transactions (t) by the Seller's ID (assuming WalletId matches SellerId)
                .Where(t => t.WalletId == sellerId &&
                            // AND ensure the transaction type is explicitly 'Revenue'.
                            t.Type == "Revenue")
                // Sum the 'Amount' column of all filtered transactions asynchronously.
                .SumAsync(t => t.Amount);

            // The result is the calculated total revenue (decimal).
            return totalRevenueQuery;
        }

        public async Task<List<RevenueByWeekDto>> GetRevenueByWeekAsync(int sellerId)
        {
            // --- Data Retrieval (Database Query) ---
            // Fetch all 'Revenue' transactions for the specific seller's wallet ID.
            var query = await _context.WalletTransactions
                // Filter by Wallet ID and Transaction Type ('Revenue').
                .Where(t => t.WalletId == sellerId && t.Type == "Revenue")
                // Select only the amount and date to optimize data transfer.
                .Select(t => new {
                    Amount = t.Amount,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync(); // Execute query and load results into application memory.

            var data = query;

            // --- In-Memory Grouping and Calculation ---
            // Process the data in memory to accurately group by week (since complex date logic is used).
            var revenueByWeek = data
                .GroupBy(x =>
                {
                    var dt = x.CreatedAt;
                    // Calculate the Week Number based on ISO 8601 standard (Monday start, FirstFourDayWeek).
                    var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;
                    var week = cal.GetWeekOfYear(
                        dt,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday
                    );
                    // Group key is the Year and the calculated WeekNumber.
                    return new { dt.Year, WeekNumber = week };
                })
                .Select(g => new RevenueByWeekDto
                {
                    Year = g.Key.Year,
                    WeekNumber = g.Key.WeekNumber,
                    Total = g.Sum(x => x.Amount) // Sum the total revenue for the week.
                })
                // Sort the final results chronologically.
                .OrderBy(x => x.Year)
                .ThenBy(x => x.WeekNumber)
                .ToList();

            return revenueByWeek;
        }

        public async Task<PaymentDetail?> GetByOrderIdAsync(int orderId)
        {
            var transaction = await _context.PaymentDetails
                .FirstOrDefaultAsync(pd => pd.OrderId == orderId);
            if(transaction == null)
                return null;
            return transaction;
        }

        public async Task<PaymentDetail> RemoveOrderAsync(int paymentDetailId)
        {
            var paymentDetail = await _context.PaymentDetails.FirstOrDefaultAsync(pd => pd.PaymentDetailId == paymentDetailId);
            paymentDetail.OrderId = null;
            _context.Update(paymentDetail);
            await _context.SaveChangesAsync();
            return paymentDetail;
        }
        public async Task CreatePaymentDetailAsync(PaymentDetail paymentDetail)
        {
            await _context.PaymentDetails.AddAsync(paymentDetail);
            // await _context.SaveChangesAsync();
        }
    }
}