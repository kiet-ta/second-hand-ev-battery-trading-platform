using Application.DTOs.ManagerDto;
using Application.IRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ManagerDashboardService : IManagerDashboardService
    {
        private readonly IUserRepository _userRepo;
        private readonly IItemRepository _itemRepo;
        private readonly IOrderRepository _orderRepo;
        private readonly IComplaintRepository _complaintRepo;
        private readonly IPaymentRepository _paymentRepo;
        private readonly ITransactionRepository _transactionRepository;

        public ManagerDashboardService(
            IUserRepository userRepo,
            IItemRepository itemRepo,
            IOrderRepository orderRepo,
            IComplaintRepository complaintRepo, 
            IPaymentRepository paymentRepo,
            ITransactionRepository transactionRepository)
        {
            _userRepo = userRepo;
            _itemRepo = itemRepo;
            _orderRepo = orderRepo;
            _complaintRepo = complaintRepo;
            _paymentRepo = paymentRepo;
            _transactionRepository = transactionRepository;
        }

        public async Task<ManagerDashboardMetricsDto> GetMetricsAsync()
        {
            var now = DateTime.UtcNow;

            var revenueThisMonth = await _orderRepo.GetRevenueThisMonthAsync(now);
            var totalUsers = await _userRepo.CountAsync();
            var activeListings = await _itemRepo.CountActiveAsync();
            var complaintRate = await _complaintRepo.GetComplaintRateAsync();
            var growth = await _userRepo.GetMonthlyGrowthAsync();

            return new ManagerDashboardMetricsDto
            {
                RevenueThisMonth = revenueThisMonth,
                TotalUsers = totalUsers,
                ActiveListings = activeListings,
                ComplaintRate = complaintRate,
                Growth = growth
            };
        }

        public async Task<IEnumerable<RevenueByMonthDto>> GetRevenueByMonthAsync(string range)
        {
            // parse range (e.g., "12m" -> 12)
            int monthsRange = 12;
            if (range.EndsWith("m"))
            {
                int.TryParse(range.TrimEnd('m'), out monthsRange);
            }

            var data = await _paymentRepo.GetRevenueByMonthAsync(monthsRange);

            var result = data.Select(d => new RevenueByMonthDto
            {
                Month = new DateTime(d.Year, d.Month, 1).ToString("MMM"),
                Total = d.Total
            });

            return result;
        }

        public async Task<IEnumerable<OrdersByMonthDto>> GetOrdersByMonthAsync(int monthsRange)
        {
            var endDate = DateTime.Now; // dùng local time thay vì UTC
            var startDate = endDate.AddMonths(-monthsRange + 1).Date; // bắt đầu từ đầu tháng đó

            var orders = await _orderRepo.GetOrdersWithinRangeAsync(startDate, endDate);

            var grouped = orders
                .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                .Select(g => new OrdersByMonthDto
                {
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(g.Key.Month),
                    TotalOrders = g.Count()
                })
                .ToList();

            var result = Enumerable.Range(0, monthsRange)
                .Select(i => startDate.AddMonths(i))
                .Select(d =>
                {
                    var monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(d.Month);
                    var existing = grouped.FirstOrDefault(x => x.Month == monthName);
                    return new OrdersByMonthDto
                    {
                        Month = monthName,
                        TotalOrders = existing?.TotalOrders ?? 0
                    };
                })
                .ToList();

            return result;
        }

        public async Task<IEnumerable<ProductDistributionDto>> GetProductDistributionAsync()
        {
            var itemCounts = await _itemRepo.GetItemTypeCountsAsync();
            int total = itemCounts.Sum(x => x.Count);

            if (total == 0)
            {
                return new List<ProductDistributionDto>
                {
                    new() { Name = "EV", Value = 0 },
                    new() { Name = "Battery", Value = 0 },
                    new() { Name = "Accessory", Value = 0 }
                };
            }

            return itemCounts.Select(x => new ProductDistributionDto
            {
                Name = x.ItemType,
                Value = Math.Round((double)x.Count / total * 100, 2)
            });
        }

        public async Task<List<LatestTransactionDto>> GetLatestTransactionsAsync(int limit)
        {
            return await _transactionRepository.GetLatestTransactionsAsync(limit);
        }
    }
}
