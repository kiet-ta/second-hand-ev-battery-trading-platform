using Application.DTOs;
using Application.IRepositories.IPaymentRepositories;
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

        public async Task<decimal> GetRevenueAsync(int sellerId)
        {
            var totalRevenueQuery = from pd in _context.PaymentDetails
                                    join p in _context.Payments on pd.PaymentId equals p.PaymentId
                                    join i in _context.Items on pd.ItemId equals i.ItemId
                                    where
                                        p.Status == "completed" && 
                                        i.UpdatedBy == sellerId   
                                    select pd.Amount;             

            var totalRevenue = await totalRevenueQuery.SumAsync();

            return totalRevenue;
        }

        public async Task<List<RevenueByMonthDto>> GetRevenueByMonthAsync(int sellerId)
        {
            return await _context.PaymentDetails
                .Where(p => _context.Items
                    .Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId))
                .GroupBy(p => p.OrderId != null
                    ? _context.Orders.First(o => o.OrderId == p.OrderId).CreatedAt.Month
                    : 0)
                .Select(g => new RevenueByMonthDto
                {
                    Month = g.Key,
                    Total = g.Sum(x => x.Amount)
                })
                .ToListAsync();
        }
    }
}