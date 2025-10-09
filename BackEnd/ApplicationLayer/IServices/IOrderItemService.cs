using Application.DTOs;
using Application.DTOs.ItemDtos;

namespace Application.IServices
{
    public interface IOrderItemService
    {
        Task<OrderItemDto> CreateOrderItemAsync(CreateOrderItemRequest request);
        Task<IEnumerable<OrderItemDto>> GetCartItemsByBuyerIdAsync(int buyerId);
    }
}
