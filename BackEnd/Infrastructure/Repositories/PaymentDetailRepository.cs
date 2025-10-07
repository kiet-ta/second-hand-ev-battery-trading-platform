using Application.DTOs;
using Application.IRepositories;
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
            return await _context.PaymentDetails
                .Where(p => _context.Items
                    .Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId))
                .SumAsync(p => p.Amount);
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
