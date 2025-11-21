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
            if (order == null)
                throw new Exception($"Order with ID {id} not found.");


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
            if (orders == null || !orders.Any())
                throw new Exception("No orders found.");
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
            if (dto == null)
                throw new Exception("Order data cannot be null.");
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
            if (order.OrderId <= 0)
                throw new Exception("Failed to create new order.");
            
            return order.OrderId;
        }

        public async Task<bool> UpdateOrderAsync(OrderDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            if (order == null)
                throw new Exception($"Order with ID {dto.OrderId} not found.");

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.Now;
            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
             var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                throw new Exception($"Order with ID {id} not found.");
            await _orderRepository.DeleteAsync(id);
            return true;
        }
        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {

            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            if (orders == null || orders.Count == 0)
                throw new Exception($"No orders found for user ID {userId}.");
            return orders;

        }

        public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request)
        {
            if (request == null)
                throw new Exception("Order request cannot be null.");

            // Step 1: Validate items
            var orderItems = await _orderItemRepository.GetItemsByIdsAsync(request.OrderItemIds);
            if (!orderItems.Any())
                throw new InvalidOperationException("No valid order items found");


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
            if (createdOrder == null)
                throw new Exception("Failed to create order.");

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
