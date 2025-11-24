using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Domain.Common.Constants;
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

        public async Task<OrderItem> CreateAsync(OrderItem orderItem)
        {
            var entity = new OrderItem
            {
                OrderId = orderItem.OrderId,
                BuyerId = orderItem.BuyerId,
                ItemId = orderItem.ItemId,
                Quantity = orderItem.Quantity,
                Price = orderItem.Price,
                IsDeleted = false
            };

            _context.OrderItems.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
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

        public async Task<List<OrderItem>> GetOrderItemsByItemIdsAsync(IEnumerable<int> itemIds)
        {
            return await _context.OrderItems
                .Where(o => !o.IsDeleted && o.OrderId != null && itemIds.Contains(o.ItemId))
                .ToListAsync();
        }

        public async Task UpdateRangeAsync(IEnumerable<OrderItem> orderItems)
        {   
            _context.OrderItems.UpdateRange(orderItems);
            await _context.SaveChangesAsync();
        }

        public async Task<OrderItem?> GetByIdAsync(int id)
        {
            return await _context.OrderItems
                .FirstOrDefaultAsync(o => o.OrderItemId == id && !o.IsDeleted);
        }
        public async Task<List<OrderItem>> GetByOrderIdAsync(int orderId)
        {
            return await _context.OrderItems
                                 .Where(oi => oi.OrderId == orderId)
                                 .ToListAsync();
        }

        public async Task UpdateAsync(OrderItem entity)
        {
            _context.OrderItems.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<int> CountByStatusAsync(int sellerId, string status)
        {
            return await _context.OrderItems
                .CountAsync(oi => oi.Status == status &&
                    _context.PaymentDetails
                        .Any(p => p.OrderId == oi.OrderId &&
                            _context.Items.Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId)));
        }

        public async Task<int> CountBySellerAsync(int sellerId)
        {
            return await _context.OrderItems
                .CountAsync(oi => _context.PaymentDetails
                    .Any(p => p.OrderId == oi.OrderId &&
                              _context.Items.Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId)));
        }

        public async Task<IEnumerable<OrderItem>> GetOrdersWithinRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.OrderItems
                .AsNoTracking()
                .Where(o => o.Status == OrderItemStatus.Completed.ToString() && o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                .ToListAsync();
        }

        public async Task<List<OrdersByWeekDto>> GetOrdersByWeekAsync(int sellerId)
        {
            var orders = await _context.OrderItems
                .Where(oi => oi.Status == OrderItemStatus.Completed.ToString() && 
                                                             _context.Items.Any(i => i.ItemId == oi.ItemId && i.UpdatedBy == sellerId)).ToListAsync();
            var calendar = System.Globalization.DateTimeFormatInfo.CurrentInfo.Calendar;

            var result = orders.GroupBy(oi =>
            {
                var week = calendar.GetWeekOfYear(
                    oi.CreatedAt,
                    System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                    DayOfWeek.Monday);
                return new { oi.CreatedAt.Year, Week = week };
            })
            .Select(g => new OrdersByWeekDto
            {
                Year = g.Key.Year,
                WeekNumber = (int)g.Key.Week!,
                Total = g.Count()
            })
            .OrderBy(dto => dto.Year)
            .ThenBy(dto => dto.WeekNumber).ToList();
            return result;
        }

       

    
    }
}