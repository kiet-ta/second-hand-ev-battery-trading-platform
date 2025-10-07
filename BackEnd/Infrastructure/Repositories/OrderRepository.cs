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
                    CreatedAt = order.CreatedAt,
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
    }
}
