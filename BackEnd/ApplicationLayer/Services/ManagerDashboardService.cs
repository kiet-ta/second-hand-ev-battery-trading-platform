using Application.DTOs.ManageCompanyDtos;
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
        private readonly IKYC_DocumentRepository _kycRepo;

        public ManagerDashboardService(
            IUserRepository userRepo,
            IItemRepository itemRepo,
            IOrderRepository orderRepo,
            IComplaintRepository complaintRepo, 
            IPaymentRepository paymentRepo,
            ITransactionRepository transactionRepository,
            IKYC_DocumentRepository kycRepo)
        {
            _userRepo = userRepo;
            _itemRepo = itemRepo;
            _orderRepo = orderRepo;
            _complaintRepo = complaintRepo;
            _paymentRepo = paymentRepo;
            _transactionRepository = transactionRepository;
            _kycRepo = kycRepo;
        }

        public async Task<ManagerDashboardMetricsDto> GetMetricsAsync()
        {
            var now = DateTime.UtcNow;

            var revenueThisMonth = await _orderRepo.GetRevenueThisMonthAsync(now);
            var totalUsers = await _userRepo.CountAsync();
            var activeListings = await _itemRepo.CountActiveAsync();
            var growth = await _userRepo.GetMonthlyGrowthAsync();

            return new ManagerDashboardMetricsDto
            {
                RevenueThisMonth = revenueThisMonth,
                TotalUsers = totalUsers,
                ActiveListings = activeListings,
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
            if (data == null)
                throw new Exception("Failed to retrieve revenue data.");
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
            if (orders == null)
                throw new Exception("Failed to fetch order data.");
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
            if (itemCounts == null)
                throw new Exception("Failed to fetch product distribution data.");
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
            var transactions = await _transactionRepository.GetLatestTransactionsAsync(limit);
            if (transactions == null)
                throw new Exception("Failed to fetch latest transactions.");

            return transactions;
        }

        public async Task<List<SellerPendingApprovalDto>> GetPendingApprovalsAsync()
        {
            var pending = await _kycRepo.GetPendingApprovalsAsync();
            if (pending == null)
                throw new Exception("Failed to fetch pending approvals.");

            return pending;
        }


        public async Task ApproveAsync(int docId, int staffId)
        {
            var doc = await _kycRepo.GetKycByIdAsync(docId);
            if (doc == null)
                throw new KeyNotFoundException("KYC document not found.");

            if (doc.Status != "pending")
                throw new InvalidOperationException("Document already processed.");

            doc.Status = "approved";
            doc.VerifiedBy = staffId;
            doc.VerifiedAt = DateTime.UtcNow;

            await _kycRepo.UpdateAsync(doc);

            var user = await _userRepo.GetByIdAsync(doc.UserId);
            if (user == null)
                throw new Exception("Associated user not found for KYC document.");
            if (user != null)
            {
                user.Role = "seller";
                user.KycStatus = "approved";
                await _userRepo.UpdateAsync(user);
                await _userRepo.SaveChangesAsync();
            }
        }

        public async Task RejectAsync(int docId, int staffId, string? note)
        {
            var doc = await _kycRepo.GetKycByIdAsync(docId);
            if (doc == null)
                throw new KeyNotFoundException("KYC document not found.");

            if (doc.Status != "pending")
                throw new InvalidOperationException("Document already processed.");

            doc.Status = "rejected";
            doc.VerifiedBy = staffId;
            doc.VerifiedAt = DateTime.UtcNow;
            doc.Note = note;

            await _kycRepo.UpdateAsync(doc);

            var user = await _userRepo.GetByIdAsync(doc.UserId);
            if (user == null)
                throw new Exception("Associated user not found for KYC document.");
            if (user != null)
            {
                user.KycStatus = "rejected";
                await _userRepo.UpdateAsync(user);
            }
        }
    }
}
