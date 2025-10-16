using Application.DTOs.ManagerDto;
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
    public class TransactionRepository : ITransactionRepository
    {
        private readonly EvBatteryTradingContext _context;

        public TransactionRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<List<LatestTransactionDto>> GetLatestTransactionsAsync(int limit)
        {
            var query = from p in _context.Payments
                        join buyer in _context.Users on p.UserId equals buyer.UserId
                        join pd in _context.PaymentDetails on p.PaymentId equals pd.PaymentId
                        join i in _context.Items on pd.ItemId equals i.ItemId
                        join seller in _context.Users on i.UpdatedBy equals seller.UserId
                        orderby p.CreatedAt descending
                        select new
                        {
                            p.PaymentId,
                            BuyerName = buyer.FullName,
                            SellerName = seller.FullName,
                            p.TotalAmount,
                            p.Method,
                            p.Status,
                            p.CreatedAt,
                            ItemId = i.ItemId,
                            i.Title,
                            pd.Amount
                        };

            var result = await query.Take(limit * 3).ToListAsync(); 

            var grouped = result
                .GroupBy(x => new
                {
                    x.PaymentId,
                    x.BuyerName,
                    x.SellerName,
                    x.TotalAmount,
                    x.Method,
                    x.Status,
                    x.CreatedAt
                })
                .Select(g => new LatestTransactionDto
                {
                    PaymentId = g.Key.PaymentId,
                    BuyerName = g.Key.BuyerName,
                    SellerName = g.Key.SellerName,
                    TotalAmount = g.Key.TotalAmount,
                    Method = g.Key.Method,
                    Status = g.Key.Status,
                    CreatedAt = g.Key.CreatedAt,
                    Items = g.Select(i => new TransactionItemDto
                    {
                        ItemId = i.ItemId,
                        Title = i.Title,
                        Amount = i.Amount
                    }).ToList()
                })
                .Take(limit)
                .ToList();

            return grouped;
        }
    }
}
