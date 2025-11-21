using Application.DTOs.ManageCompanyDtos;
using Application.IRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Domain.Common.Constants;
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
        private readonly IComplaintRepository _complaintRepo;
        private readonly IUnitOfWork _unitOfWork;


        public ManagerDashboardService(
            IComplaintRepository complaintRepo, 
            IUnitOfWork unitOfWork)
        {
            _complaintRepo = complaintRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<ManagerDashboardMetricsDto> GetMetricsAsync()
        {
            var now = DateTime.Now;

            var revenueThisMonth = await _unitOfWork.Orders.GetRevenueThisMonthAsync(now);
            var totalUsers = await _unitOfWork.Users.CountAsync();
            var activeListings = await _unitOfWork.Items.CountActiveAsync();
            var growth = await _unitOfWork.Users.GetMonthlyGrowthAsync();

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
            // Parse the requested range (e.g., "12m" for 12 months)
            int monthsRange = 12;
            if (range.EndsWith("m"))
            {
                // Try to parse the number part, defaulting to 12 if parsing fails
                int.TryParse(range.TrimEnd('m'), out monthsRange);
            }
            var data = await _unitOfWork.Payments.GetRevenueByMonthAsync(monthsRange);

            if (data == null)
                throw new Exception("Failed to retrieve revenue data.");

            // Map the raw (Year, Month, Total) data from the repository into the final DTO format.
            var result = data.Select(d => new RevenueByMonthDto
            {
                // Format the Year and Month into a readable short month name (e.g., "Jan")
                Month = new DateTime(d.Year, d.Month, 1).ToString("MMM"),
                Total = d.Total
            });

            return result;
        }

        public async Task<IEnumerable<OrdersByMonthDto>> GetOrdersByMonthAsync(int monthsRange)
        {
            var endDate = DateTime.Now; // dùng local time thay vì UTC
            var startDate = endDate.AddMonths(-monthsRange + 1).Date; // bắt đầu từ đầu tháng đó

            var orders = await _unitOfWork.Orders.GetOrdersWithinRangeAsync(startDate, endDate);
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

            var itemCounts = await _unitOfWork.Items.GetItemTypeCountsAsync();
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
            var transactions = await _unitOfWork.Transactions.GetLatestTransactionsAsync(limit);
            if (transactions == null)
                throw new Exception("Failed to fetch latest transactions.");

            return transactions;
        }

        public async Task<List<SellerPendingApprovalDto>> GetPendingApprovalsAsync()
        {
            var pending = await _unitOfWork.KycDocuments.GetPendingApprovalsAsync();
            if (pending == null)
                throw new Exception("Failed to fetch pending approvals.");

            return pending;
        }


        public async Task ApproveAsync(int docId, int staffId)
        {
            var doc = await _unitOfWork.KycDocuments.GetKycByIdAsync(docId);
            if (doc == null)
                throw new KeyNotFoundException("KYC document not found.");

            if (doc.Status != KycStatus.Pending.ToString())
                throw new InvalidOperationException("Document already processed.");

            doc.Status = KycStatus.Approved.ToString();
            doc.VerifiedBy = staffId;
            doc.VerifiedAt = DateTime.Now;

            await _unitOfWork.KycDocuments.UpdateAsync(doc);

            var user = await _unitOfWork.Users.GetByIdAsync(doc.UserId);
            if (user == null)
                throw new Exception("Associated user not found for KYC document.");
            if (user != null)
            {
                user.Role = UserRole.Seller.ToString();
                user.KycStatus = KycStatus.Approved.ToString();
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Users.SaveChangesAsync();
            }
        }

        public async Task RejectAsync(int docId, int staffId, string? note)
        {
            var doc = await _unitOfWork.KycDocuments.GetKycByIdAsync(docId);
            if (doc == null)
                throw new KeyNotFoundException("KYC document not found.");

            if (doc.Status != KycStatus.Pending.ToString())
                throw new InvalidOperationException("Document already processed.");

            doc.Status = KycStatus.Rejected.ToString();
            doc.VerifiedBy = staffId;
            doc.VerifiedAt = DateTime.Now;
            doc.Note = note;

            await _unitOfWork.KycDocuments.UpdateAsync(doc);

            var user = await _unitOfWork.Users.GetByIdAsync(doc.UserId);
            if (user == null)
                throw new Exception("Associated user not found for KYC document.");
            if (user != null)
            {
                user.Role = UserRole.Seller.ToString();
                user.KycStatus = KycStatus.Rejected.ToString();
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.Users.SaveChangesAsync();
            }
        }
    }
}
