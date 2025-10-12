using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class OrderItemRepository : IOrderItemRepository
    {
        private readonly EvBatteryTradingContext _context;

        public OrderItemRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<OrderItemDto> CreateOrderItemAsync(CreateOrderItemRequest request)
        {
            var entity = new OrderItem
            {
                OrderId = null,
                BuyerId = request.BuyerId,
                ItemId = request.ItemId,
                Quantity = request.Quantity,
                Price = request.Price,
                IsDeleted = false
            };

            _context.OrderItems.Add(entity);
            await _context.SaveChangesAsync();

            return new OrderItemDto
            {
                OrderItemId = entity.OrderItemId,
                OrderId = entity.OrderId,
                BuyerId = entity.BuyerId,
                ItemId = entity.ItemId,
                Quantity = entity.Quantity,
                Price = entity.Price
            };
        }

        public async Task<IEnumerable<OrderItem>> GetCartItemsByBuyerIdAsync(int buyerId)
        {
            return await _context.OrderItems
                .Where(o => o.BuyerId == buyerId && o.OrderId == null && !(o.IsDeleted == true))
                .ToListAsync();
        }

        public async Task<List<OrderItem>> GetItemsByIdsAsync(IEnumerable<int> ids)
        {
            return await _context.OrderItems
                .Where(x => ids.Contains(x.OrderItemId))
                .ToListAsync();
        }

        public async Task UpdateRangeAsync(IEnumerable<OrderItem> orderItems)
        {
            _context.OrderItems.UpdateRange(orderItems);
            await _context.SaveChangesAsync();
        }
    }
}
