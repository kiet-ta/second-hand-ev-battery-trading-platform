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
        private readonly IOrderRepository _repo;

        public OrderService(IOrderRepository repo)
        {
            _repo = repo;
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var order = await _repo.GetByIdAsync(id);
            if (order == null) return null;

            return new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                Status = order.Status,
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
            var orders = await _repo.GetAllAsync();
            return orders.Select(order => new OrderDto
            {
                OrderId = order.OrderId,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                Status = order.Status
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

            await _repo.AddAsync(order);
            return order.OrderId;
        }

        public async Task<bool> UpdateOrderAsync(OrderDto dto)
        {
            var order = await _repo.GetByIdAsync(dto.OrderId);
            if (order == null) return false;

            order.Status = dto.Status;
            order.UpdatedAt = null; // DateTime.Now;
            await _repo.UpdateAsync(order);
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
            await _repo.DeleteAsync(id);
            return true;
        }
    }
}
