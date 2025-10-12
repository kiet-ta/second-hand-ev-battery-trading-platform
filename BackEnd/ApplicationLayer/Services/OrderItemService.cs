using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;

namespace Application.Services
{
    public class OrderItemService : IOrderItemService
    {
        private readonly IOrderItemRepository _orderItemRepository;

        public OrderItemService(IOrderItemRepository orderItemRepository)
        {
            _orderItemRepository = orderItemRepository;
        }

        public async Task<OrderItemDto> CreateOrderItemAsync(CreateOrderItemRequest request)
        {
            return await _orderItemRepository.CreateOrderItemAsync(request);
        }

        public async Task<IEnumerable<OrderItemDto>> GetCartItemsByBuyerIdAsync(int buyerId)
        {
            var items = await _orderItemRepository.GetCartItemsByBuyerIdAsync(buyerId);

            return items.Select(o => new OrderItemDto
            {
                OrderItemId = o.OrderItemId,
                ItemId = o.ItemId,
                Quantity = o.Quantity,
                Price = o.Price
            });
        }
    }
}
