using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderItemRepository _orderItemRepository;

        public OrderService(IOrderRepository orderRepository, IOrderItemRepository orderItemRepository)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;

            return new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                Status = order.Status,
                CreatedAt = order.CreatedAt
                //Items = order.OrderItems?.Select(i => new OrderItemDto
                //{
                //    ItemId = i.ItemId,
                //    Quantity = i.Quantity,
                //    Price = i.Price
                //}).ToList()
            };
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return orders.Select(order => new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                Status = order.Status,
                CreatedAt = order.CreatedAt
            });
        }

        public async Task<int> CreateOrderAsync(OrderDto dto)
        {
            var order = new Order
            {
                BuyerId = dto.BuyerId,
                AddressId = dto.AddressId,
                Status = "pending",
                CreatedAt = dto.CreatedAt, //DateTime.Now,
                UpdatedAt = dto.UpdatedAt, //DateTime.Now,
                //OrderItems = dto.Items?.Select(i => new OrderItem
                //{
                //    ItemId = i.ItemId,
                //    Quantity = i.Quantity,
                //    Price = i.Price
                //}).ToList()
            };

            await _orderRepository.AddAsync(order);
            return order.OrderId;
        }

        public async Task<bool> UpdateOrderAsync(OrderDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            if (order == null) return false;

            order.Status = dto.Status;
            order.UpdatedAt = null; // DateTime.Now;
            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
            await _orderRepository.DeleteAsync(id);
            return true;
        }
        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {
            return await _orderRepository.GetOrdersByUserIdAsync(userId);
        }

        public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request)
        {
            // Step 1: Validate items
            var orderItems = await _orderItemRepository.GetItemsByIdsAsync(request.OrderItemIds);
            if (!orderItems.Any())
                throw new Exception("No valid order items found");

            // Step 2: Create order
            var order = new Order
            {
                BuyerId = request.BuyerId,
                AddressId = request.AddressId,
                Status = "pending",
                CreatedAt = request.CreatedAt,
                UpdatedAt = request.UpdatedAt
                
            };
            var createdOrder = await _orderRepository.AddOrderAsync(order);

            // Step 3: Update order items
            foreach (var item in orderItems)
            {
                item.OrderId = createdOrder.OrderId;
            }

            await _orderItemRepository.UpdateRangeAsync(orderItems);

            // Step 4: Build response
            var response = new OrderResponseDto
            {
                OrderId = createdOrder.OrderId,
                BuyerId = createdOrder.BuyerId,
                AddressId = createdOrder.AddressId,
                Status = createdOrder.Status,
                CreatedAt = createdOrder.CreatedAt,
                isDeleted = true,
                Items = orderItems.Select(x => new OrderItemDto
                {
                    OrderItemId = x.OrderItemId,
                    OrderId = x.OrderId,
                    ItemId = x.ItemId,
                    Quantity = x.Quantity,
                    Price = x.Price
                }).ToList()
            };

            return response;
        }
    }
}
