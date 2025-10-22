using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
            var result = await _orderItemRepository.CreateOrderItemAsync(request)
                ?? throw new Exception("Failed to create order item.");
            return result;
        }

        public async Task<IEnumerable<OrderItemDto>> GetCartItemsByBuyerIdAsync(int buyerId)
        {
            var items = await _orderItemRepository.GetCartItemsByBuyerIdAsync(buyerId)
                ?? throw new Exception("Failed to retrieve cart items.");

            return items.Select(o => new OrderItemDto
            {
                OrderItemId = o.OrderItemId,
                ItemId = o.ItemId,
                Quantity = o.Quantity,
                Price = o.Price
            });
        }

        public async Task<bool> UpdateOrderItemAsync(int id, UpdateOrderItemDto dto)
        {
            var orderItem = await _orderItemRepository.GetByIdAsync(id)
                ?? throw new Exception("Order item not found.");

            if (orderItem.IsDeleted)
                throw new Exception("Order item already deleted.");

            orderItem.Quantity = dto.Quantity;
            orderItem.Price = dto.Price;

            await _orderItemRepository.UpdateAsync(orderItem);
            return true;
        }

        public async Task<bool> DeleteOrderItemAsync(int id)
        {
            var orderItem = await _orderItemRepository.GetByIdAsync(id)
                ?? throw new Exception("Order item not found.");

            if (orderItem.IsDeleted)
                throw new Exception("Order item already deleted.");

            orderItem.IsDeleted = true;
            await _orderItemRepository.UpdateAsync(orderItem);
            return true;
        }
    }
}
