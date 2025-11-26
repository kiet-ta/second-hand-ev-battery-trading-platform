using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class OrderItemService : IOrderItemService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<OrderItemDto> CreateOrderItemAsync(CreateOrderItemRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Order item request cannot be null.");

            if (request.BuyerId <= 0)
                throw new ArgumentException("Invalid buyer ID.", nameof(request.BuyerId));

            if (request.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.", nameof(request.Quantity));

            var listOfCart = await _unitOfWork.OrderItems.GetCartItemsByBuyerIdAsync(request.BuyerId);
            var existingCart = listOfCart.FirstOrDefault(ci => ci.ItemId == request.ItemId && !ci.IsDeleted && ci.OrderId == null);

            if (existingCart != null)
            {
                var item = await _unitOfWork.Items.GetByIdAsync(request.ItemId);
                if (item == null)
                    throw new KeyNotFoundException($"Item with ID {request.ItemId} not found.");

                if (existingCart.Quantity + request.Quantity > item.Quantity)
                    throw new InvalidOperationException("Adding the requested quantity exceeds available stock.");
                }
                else
                {
                    existingCart.Price = request.Price;
                    existingCart.Quantity += request.Quantity;
                    await _unitOfWork.OrderItems.UpdateAsync(existingCart);
                    return new OrderItemDto
                    {
                        OrderItemId = existingCart.OrderItemId,
                        ItemId = existingCart.ItemId,
                        Quantity = existingCart.Quantity,
                        Price = existingCart.Price
                    };
                }

                existingCart.Price = request.Price;
                existingCart.Quantity += request.Quantity;
                await _unitOfWork.OrderItems.UpdateAsync(existingCart);
                return new OrderItemDto
                {
                    OrderItemId = existingCart.OrderItemId,
                    ItemId = existingCart.ItemId,
                    Quantity = existingCart.Quantity,
                    Price = existingCart.Price
                };
            }
            else
            {
                var newOrderItem = await _unitOfWork.OrderItems.CreateOrderItemAsync(request);
                if (newOrderItem == null)
                    throw new ArgumentException("Failed to create order item."); 

                return new OrderItemDto
                {
                    OrderItemId = newOrderItem.OrderItemId,
                    ItemId = newOrderItem.ItemId,
                    Quantity = newOrderItem.Quantity,
                    Price = newOrderItem.Price
                };
            }
        }



        public async Task<IEnumerable<OrderItemDto>> GetCartItemsByBuyerIdAsync(int buyerId)
        {
            if (buyerId <= 0)
                throw new ArgumentException("Invalid buyer ID.", nameof(buyerId));

            var items = await _unitOfWork.OrderItems.GetCartItemsByBuyerIdAsync(buyerId);
            if (items == null)
                throw new Exception($"Failed to retrieve cart items for buyer ID {buyerId}.");
            if (!items.Any())
                return Enumerable.Empty<OrderItemDto>();

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

            var orderItem = await _unitOfWork.OrderItems.GetByIdAsync(id);
            if (orderItem == null)
                throw new KeyNotFoundException($"Order item with ID {id} not found.");

            if (orderItem.IsDeleted)
                throw new InvalidOperationException("Cannot update a deleted order item.");

            if (dto.Price < 0)
                throw new ArgumentException("Price cannot be negative.", nameof(dto.Price));

            if (dto.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0.", nameof(dto.Quantity));

            if (dto.Quantity > 1000) 
                throw new InvalidOperationException("Quantity exceeds available stock.");


            orderItem.Quantity = dto.Quantity;
            orderItem.Price = dto.Price;

            await _unitOfWork.OrderItems.UpdateAsync(orderItem);
            return true;
        }



        public async Task<bool> DeleteOrderItemAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid order item ID.", nameof(id));

            var orderItem = await _unitOfWork.OrderItems.GetByIdAsync(id);
            if (orderItem == null)
                throw new KeyNotFoundException($"Order item with ID {id} not found.");

            if (orderItem.IsDeleted)
                throw new InvalidOperationException("Order item already deleted.");

            if (orderItem.OrderId != null)
                throw new InvalidOperationException("Cannot delete an order item that is already part of an order.");

            orderItem.IsDeleted = true;
            await _unitOfWork.OrderItems.UpdateAsync(orderItem);
            return true;
        }

        public async Task<bool> ConfirmShippingAsync(int orderItemId)
        {
            if (orderItemId <= 0)
                throw new ArgumentException("Invalid order item ID.", nameof(orderItemId));
            var orderItem = await _unitOfWork.OrderItems.GetByIdAsync(orderItemId);
            if (orderItem == null)
                throw new KeyNotFoundException($"Order item with ID {orderItemId} not found.");
            if (orderItem.IsDeleted)
                throw new InvalidOperationException("Cannot confirm shipping for a deleted order item.");
            orderItem.Status = OrderItemStatus.Shipped.ToString();
            orderItem.UpdatedAt = DateTime.Now;
            await _unitOfWork.OrderItems.UpdateAsync(orderItem);
            return true;
        }
    }
}
