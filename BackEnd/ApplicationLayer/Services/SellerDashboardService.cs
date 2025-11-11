using Application.DTOs;
using Application.IRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Domain.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SellerDashboardService : ISellerDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SellerDashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SellerDashboardDto> GetSellerDashboardAsync(int sellerId)
        {
            if (sellerId <= 0)
                throw new ArgumentException("Seller ID must be greater than 0.", nameof(sellerId));

            try
            {
                var listings = await _unitOfWork.Items.CountAllBySellerAsync(sellerId);
                var orders = await _unitOfWork.Orders.CountBySellerAsync(sellerId);
                var sold = await _unitOfWork.Items.GetTotalItemsSoldBySellerAsync(sellerId);
                var revenue = await _unitOfWork.PaymentDetails.GetRevenueAsync(sellerId);

                if (listings < 0)
                    throw new Exception("Failed to retrieve total listings.");
                if (orders < 0)
                    throw new Exception("Failed to retrieve total orders.");

                var productStats = new ProductStatisticsDto
                {
                    Active = await _unitOfWork.Items.CountByStatusAsync(sellerId, ItemStatus.Active
                    .ToString()),
                    Pending = await _unitOfWork.Items.CountByStatusAsync(sellerId, ItemStatus.Pending.ToString()),
                    Inactive = await _unitOfWork.Items.CountByStatusAsync(sellerId, ItemStatus.Rejected.ToString()),
                    Featured = 5 // có thể mở rộng logic sau
                };

                var orderStats = new OrderStatisticsDto
                {
                    New = await _unitOfWork.Orders.CountByStatusAsync(sellerId, OrderStatus.Pending.ToString()),
                    Processing = await _unitOfWork.Orders.CountByStatusAsync(sellerId, OrderStatus.Paid.ToString()),
                    Completed = await _unitOfWork.Orders.CountByStatusAsync(sellerId, OrderStatus.Completed.ToString()),
                    Cancelled = await _unitOfWork.Orders.CountByStatusAsync(sellerId, OrderStatus.Cancelled.ToString())
                };

                var revenueByWeek = await _unitOfWork.PaymentDetails.GetRevenueByWeekAsync(sellerId);
                if (revenueByWeek == null)
                    throw new Exception("Failed to retrieve revenue by month.");

                var ordersByWeek = await _unitOfWork.Orders.GetOrdersByWeekAsync(sellerId);
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
