using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
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

            if (order != null)
            {
                // Load OrderItems -> OrderId
                var orderItems = await _context.OrderItems
                    .Where(oi => oi.OrderId == id)
                    .ToListAsync();

                // If you want return OrderDto
                order = new Order
                {
                    OrderId = order.OrderId,
                    BuyerId = order.BuyerId,
                    AddressId = order.AddressId,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt
                    // fields other...
                };
            }

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

        public async Task<List<OrdersByMonthDto>> GetOrdersByMonthAsync(int sellerId)
        {
            return await _context.Orders
                .Where(o => _context.PaymentDetails
                    .Any(p => p.OrderId == o.OrderId &&
                        _context.Items.Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId)))
                .GroupBy(o => o.CreatedAt.Month)
                .Select(g => new OrdersByMonthDto
                {
                    Month = g.Key,
                    TotalOrders = g.Count()
                })
                .ToListAsync();
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
    }
}
