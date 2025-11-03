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
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Order item request cannot be null.");

            if (request.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.", nameof(request.Quantity));

            var result = await _orderItemRepository.CreateOrderItemAsync(request);
            if (result == null)
                throw new Exception("Failed to create order item. Repository returned null.");

            return result;
        }


        public async Task<IEnumerable<OrderItemDto>> GetCartItemsByBuyerIdAsync(int buyerId)
        {
            if (buyerId <= 0)
                throw new ArgumentException("Invalid buyer ID.", nameof(buyerId));

            var items = await _orderItemRepository.GetCartItemsByBuyerIdAsync(buyerId);
            if (items == null)
                throw new Exception($"Failed to retrieve cart items for buyer ID {buyerId}.");
            if (!items.Any())
                throw new Exception($"No items found in cart for buyer ID {buyerId}.");

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
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Update data cannot be null.");

            var orderItem = await _orderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
                throw new KeyNotFoundException($"Order item with ID {id} not found.");

            if (orderItem.IsDeleted)
                throw new InvalidOperationException("Cannot update a deleted order item.");

            if (dto.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.", nameof(dto.Quantity));
            if (dto.Price < 0)
                throw new ArgumentException("Price cannot be negative.", nameof(dto.Price));

            orderItem.Quantity = dto.Quantity;
            orderItem.Price = dto.Price;

            await _orderItemRepository.UpdateAsync(orderItem);
            return true;
        }

        public async Task<bool> DeleteOrderItemAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid order item ID.", nameof(id));

            var orderItem = await _orderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
                throw new KeyNotFoundException($"Order item with ID {id} not found.");

            if (orderItem.IsDeleted)
                throw new InvalidOperationException("Order item already deleted.");

            orderItem.IsDeleted = true;
            await _orderItemRepository.UpdateAsync(orderItem);
            return true;
        }
    }
}
