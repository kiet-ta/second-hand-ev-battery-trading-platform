using Application.DTOs;
using Application.IRepositories;
using Application.IRepositories.IPaymentRepositories;
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
            _itemRepo = itemRepo ?? throw new ArgumentNullException(nameof(itemRepo));
            _orderRepo = orderRepo ?? throw new ArgumentNullException(nameof(orderRepo));
            _paymentRepo = paymentRepo ?? throw new ArgumentNullException(nameof(paymentRepo));
        }

        public async Task<SellerDashboardDto> GetSellerDashboardAsync(int sellerId)
        {
            if (sellerId <= 0)
                throw new ArgumentException("Seller ID must be greater than 0.", nameof(sellerId));

            try
            {
                var listings = await _itemRepo.CountAllBySellerAsync(sellerId);
                var orders = await _orderRepo.CountBySellerAsync(sellerId);
                var sold = await _itemRepo.GetTotalItemsSoldBySellerAsync(sellerId);
                var revenue = await _paymentRepo.GetRevenueAsync(sellerId);

                if (listings < 0)
                    throw new Exception("Failed to retrieve total listings.");
                if (orders < 0)
                    throw new Exception("Failed to retrieve total orders.");

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

                var revenueByWeek = await _paymentRepo.GetRevenueByWeekAsync(sellerId);
                if (revenueByWeek == null)
                    throw new Exception("Failed to retrieve revenue by month.");

                var ordersByWeek = await _orderRepo.GetOrdersByWeekAsync(sellerId);
                if (ordersByWeek == null)
                    throw new Exception("Failed to retrieve orders by month.");

                return new SellerDashboardDto
                {
                    Listings = listings,
                    Orders = orders,
                    Sold = sold,
                    Revenue = revenue,
                    ProductStatistics = productStats,
                    OrderStatistics = orderStats,
                    RevenueByWeek = revenueByWeek,
                    OrdersByWeek = ordersByWeek
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error while fetching seller dashboard data: {ex.Message}", ex);
            }
        }
    }
}
