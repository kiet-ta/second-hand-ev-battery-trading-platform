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
        Task<int> CountBySellerAsync(int sellerId);
        Task<int> CountByStatusAsync(int sellerId, string status);
        Task<List<OrdersByMonthDto>> GetOrdersByMonthAsync(int sellerId);
        Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<Order> AddOrderAsync(Order order);
    }
}
