using Application.DTOs;
using Application.DTOs.ItemDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IOrderService
    {
        Task ConfirmOrderDeliveryAsync(int orderId, int buyerId);
        Task ConfirmOrderShippingAsync(int orderId, int sellerId);
        Task<OrderDto> GetOrderByIdAsync(int id);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
        Task<int> CreateOrderAsync(OrderDto dto);
        Task<bool> UpdateOrderAsync(OrderDto dto);
        Task<bool> DeleteOrderAsync(int id);
        Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request);
    }
}
