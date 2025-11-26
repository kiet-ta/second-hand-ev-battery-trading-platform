using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
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
    public class OrderRepository : IOrderRepository
    {
        private readonly EvBatteryTradingContext _context;

        public OrderRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<Order> GetByIdAsync(int id)
        {
            var order = await _context.Orders
        .FirstOrDefaultAsync(o => o.OrderId == id);

            return order!;
        }

        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _context.Orders
                //.Include(o => o.OrderItems)
                .ToListAsync();
        }

        public async Task AddAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
            {
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
        }

        //Feature: Seller Dashboard



        public async Task<List<OrdersByWeekDto>> GetOrdersByWeekAsync(int sellerId)
        {
            var ordersQuery = from o in _context.Orders
                              join oi in _context.OrderItems on o.OrderId equals oi.OrderId
                              join pd in _context.PaymentDetails on o.OrderId equals pd.OrderId
                              join i in _context.Items on pd.ItemId equals i.ItemId
                              where i.UpdatedBy == sellerId // Filter: Order must involve an Item updated/owned by the seller
                                    && oi.Status == OrderItemStatus.Completed.ToString() // Filter: Only include completed orders
                                    && o.CreatedAt != null // Filter: Ensure the creation date is not null
                              select new { o.OrderId, o.CreatedAt };
            var orders = await ordersQuery.Distinct().ToListAsync();
            var result = orders
                .GroupBy(o =>
                {
                    var dt = o.CreatedAt;

                    var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;

                    var week = cal.GetWeekOfYear(
                        dt,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday);

                    return new { dt.Year, WeekNumber = week };
                })
                .Select(g => new OrdersByWeekDto
                {
                    Year = g.Key.Year,
                    WeekNumber = g.Key.WeekNumber,
                    Total = g.Count() // Count the number of unique orders in the group (week)
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.WeekNumber)
                .ToList();

            return result;
        }

        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.BuyerId == userId)
                .Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    BuyerId = o.BuyerId,
                    AddressId = o.AddressId,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    ShippingPrice = o.ShippingPrice,
                    Items = _context.OrderItems
                        .Where(oi => oi.OrderId == o.OrderId && !(oi.IsDeleted == true))
                        .Select(oi => new OrderItemDto
                        {
                            OrderItemId = oi.OrderItemId,
                            OrderId = oi.OrderId,
                            ItemId = oi.ItemId,
                            Quantity = oi.Quantity,
                            Price = oi.Price,
                            Status = oi.Status
                        })
                        .ToList()
                })
                .ToListAsync();

            return orders;
        }
        public async Task<Order> AddOrderAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<decimal> GetRevenueThisMonthAsync(DateTime now)
        {
            return await _context.Wallets
                .Where(o => o.UserId == 4 && o.UpdatedAt.Month == now.Month && o.UpdatedAt.Year == now.Year && o.Status == WalletStatus.Active.ToString())
                .SumAsync(o => (decimal?)o.Balance) ?? 0;
        }

        public async Task<Order> GetOrderWithItemsAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems) // Eager loading OrderItems
                .AsSplitQuery()
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            return order;
        }
    }
}
