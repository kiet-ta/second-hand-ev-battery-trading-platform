using Application.DTOs;
using Application.DTOs.ItemDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IOrderRepository
    {
        Task<Order> GetByIdAsync(int id);
        Task<IEnumerable<Order>> GetAllAsync();
        Task AddAsync(Order order);
        Task UpdateAsync(Order order);
        Task DeleteAsync(int id);

        //Feature: Seller Dashboard
        Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<Order> AddOrderAsync(Order order);
        Task<decimal> GetRevenueThisMonthAsync(DateTime now);
        Task<Order> GetOrderWithItemsAsync(int orderId);


    }
}
