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

        public async Task<List<RevenueByWeekDto>> GetRevenueByWeekAsync(int sellerId)
        {
            var query = from pd in _context.PaymentDetails
                        join o in _context.Orders on pd.OrderId equals o.OrderId
                        join p in _context.Payments on pd.PaymentId equals p.PaymentId
                        join i in _context.Items on pd.ItemId equals i.ItemId
                        where i.UpdatedBy == sellerId && p.Status == "completed"
                        select new { pd.Amount, o.CreatedAt };

            var data = await query.ToListAsync();

            var revenueByWeek = data
                .GroupBy(x =>
                {
                    var dt = x.CreatedAt;
                    var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;
                    var week = cal.GetWeekOfYear(dt, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
                    return new { dt.Year, WeekNumber = week };
                })
                .Select(g => new RevenueByWeekDto
                {
                    Year = g.Key.Year,
                    WeekNumber = g.Key.WeekNumber,
                    Total = g.Sum(x => x.Amount)
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.WeekNumber)
                .ToList();

            return revenueByWeek;
        }
    }
}