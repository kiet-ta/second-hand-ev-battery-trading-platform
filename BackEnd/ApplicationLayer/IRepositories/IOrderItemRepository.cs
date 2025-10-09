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
        Task UpdateRangeAsync(IEnumerable<OrderItem> orderItems);
    }
}
