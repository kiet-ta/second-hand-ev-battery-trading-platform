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
        public async Task<int> CountBySellerAsync(int sellerId)
        {
            return await _context.Orders
                .CountAsync(o => _context.PaymentDetails
                    .Any(p => p.OrderId == o.OrderId &&
                              _context.Items.Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId)));
        }

        public async Task<int> CountByStatusAsync(int sellerId, string status)
        {
            return await _context.Orders
                .CountAsync(o => o.Status == status &&
                    _context.PaymentDetails
                        .Any(p => p.OrderId == o.OrderId &&
                            _context.Items.Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId)));
        }

        public async Task<List<OrdersByWeekDto>> GetOrdersByWeekAsync(int sellerId)
        {
            // --- 1. Query Data from Database (LINQ to Entities) ---
            // This query joins Orders, PaymentDetails, and Items to find all 'Completed' orders
            // associated with the specific seller (identified by i.UpdatedBy == sellerId).
            var ordersQuery = from o in _context.Orders
                                  // Join Orders with PaymentDetails (assuming OrderDetails is linked via PaymentDetails)
                              join pd in _context.PaymentDetails on o.OrderId equals pd.OrderId
                              // Join PaymentDetails with Items to find the Seller
                              join i in _context.Items on pd.ItemId equals i.ItemId
                              where i.UpdatedBy == sellerId // Filter: Order must involve an Item updated/owned by the seller
                                    && o.Status == OrderStatus.Completed.ToString() // Filter: Only include completed orders
                                    && o.CreatedAt != null // Filter: Ensure the creation date is not null
                              select new { o.OrderId, o.CreatedAt };

            // Execute the query, fetch the data into the client's memory (List<T>), 
            // and ensure each OrderId is distinct (since one order might have multiple PaymentDetails/Items).
            var orders = await ordersQuery.Distinct().ToListAsync();

            // --- 2. Client-Side Grouping (LINQ to Objects) ---
            // Perform grouping on the client side to accurately calculate the WeekNumber 
            // based on specific Calendar rules (ISO 8601).
            var result = orders
                .GroupBy(o =>
                {
                    var dt = o.CreatedAt;

                    // Get the current culture's calendar
                    var cal = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;

                    // Calculate the Week Number using ISO 8601 rules (FirstFourDayWeek, Week starts on Monday)
                    var week = cal.GetWeekOfYear(
                        dt,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday);

                    // Group by Year and the calculated Week Number
                    return new { dt.Year, WeekNumber = week };
                })
                .Select(g => new OrdersByWeekDto
                {
                    Year = g.Key.Year,
                    WeekNumber = g.Key.WeekNumber,
                    Total = g.Count() // Count the number of unique orders in the group (week)
                })
                // Final ordering for presentation purposes
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
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    Items = _context.OrderItems
                        .Where(oi => oi.OrderId == o.OrderId && !(oi.IsDeleted == true))
                        .Select(oi => new OrderItemDto
                        {
                            OrderItemId = oi.OrderItemId,
                            OrderId = oi.OrderId,
                            ItemId = oi.ItemId,
                            Quantity = oi.Quantity,
                            Price = oi.Price
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

        public async Task<IEnumerable<Order>> GetOrdersWithinRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Orders
                .AsNoTracking()
                .Where(o => o.Status == OrderStatus.Completed.ToString() && o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                .ToListAsync();
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
