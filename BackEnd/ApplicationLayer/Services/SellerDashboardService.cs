using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SellerDashboardService : ISellerDashboardService
    {
        private readonly IItemRepository _itemRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly IPaymentDetailRepository _paymentRepo;

        public SellerDashboardService(IItemRepository itemRepo, IOrderRepository orderRepo, IPaymentDetailRepository paymentRepo)
        {
            _itemRepo = itemRepo;
            _orderRepo = orderRepo;
            _paymentRepo = paymentRepo;
        }

        public async Task<SellerDashboardDto> GetSellerDashboardAsync(int sellerId)
        {
            var listings = await _itemRepo.CountAllBySellerAsync(sellerId);
            var orders = await _orderRepo.CountBySellerAsync(sellerId);
            var sold = await _itemRepo.CountByStatusAsync(sellerId, "sold");
            var revenue = await _paymentRepo.GetRevenueAsync(sellerId);

            var productStats = new ProductStatisticsDto
            {
                Active = await _itemRepo.CountByStatusAsync(sellerId, "active"),
                Pending = await _itemRepo.CountByStatusAsync(sellerId, "pending"),
                Inactive = await _itemRepo.CountByStatusAsync(sellerId, "rejected"),
                Featured = 5 // có thể mở rộng logic sau
            };

            var orderStats = new OrderStatisticsDto
            {
                New = await _orderRepo.CountByStatusAsync(sellerId, "pending"),
                Processing = await _orderRepo.CountByStatusAsync(sellerId, "paid"),
                Completed = await _orderRepo.CountByStatusAsync(sellerId, "completed"),
                Cancelled = await _orderRepo.CountByStatusAsync(sellerId, "canceled")
            };

            return new SellerDashboardDto
            {
                Listings = listings,
                Orders = orders,
                Sold = sold,
                Revenue = revenue,
                ProductStatistics = productStats,
                OrderStatistics = orderStats,
                RevenueByMonth = await _paymentRepo.GetRevenueByMonthAsync(sellerId),
                OrdersByMonth = await _orderRepo.GetOrdersByMonthAsync(sellerId)
            };
        }
    }
}
