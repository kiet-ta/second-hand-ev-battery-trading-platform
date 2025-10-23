using Application.DTOs.ManageCompanyDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IManagerDashboardService
    {
        Task<ManagerDashboardMetricsDto> GetMetricsAsync();
        Task<IEnumerable<RevenueByMonthDto>> GetRevenueByMonthAsync(string range);
        Task<IEnumerable<OrdersByMonthDto>> GetOrdersByMonthAsync(int monthsRange);
        Task<IEnumerable<ProductDistributionDto>> GetProductDistributionAsync();
        Task<List<LatestTransactionDto>> GetLatestTransactionsAsync(int limit);
        Task<List<SellerPendingApprovalDto>> GetPendingApprovalsAsync();
        Task ApproveAsync(int docId, int staffId);
        Task RejectAsync(int docId, int staffId, string? note);
    }
}
