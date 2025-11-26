using Application.DTOs;
using Application.DTOs.ItemDtos;
using Domain.Entities;

namespace Application.IRepositories
{
    public interface IOrderItemRepository
    {
        Task<OrderItemDto> CreateOrderItemAsync(CreateOrderItemRequest request);

        Task<IEnumerable<OrderItem>> GetCartItemsByBuyerIdAsync(int buyerId);

        Task<List<OrderItem>> GetItemsByIdsAsync(IEnumerable<int> ids);

        Task<List<OrderItem>> GetOrderItemsByItemIdsAsync(IEnumerable<int> itemId);

        Task UpdateRangeAsync(IEnumerable<OrderItem> orderItems);

        Task<OrderItem?> GetByIdAsync(int id);

        Task<List<OrderItem>> GetByOrderIdAsync(int orderId);

        Task UpdateAsync(OrderItem entity);

        Task<OrderItem> CreateAsync(OrderItem orderItem);

        Task<int> CountByStatusAsync(int sellerId, string status);

        Task<List<OrdersByWeekDto>> GetOrdersByWeekAsync(int sellerId);
        
        Task<int> CountBySellerAsync(int sellerId);

        Task<IEnumerable<OrderItem>> GetOrdersWithinRangeAsync(DateTime startDate, DateTime endDate);
    }
}