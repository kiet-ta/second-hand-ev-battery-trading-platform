using Application.DTOs.ManagerDto;
using Application.IServices;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManagerDashboardController : ControllerBase
    {
        private readonly IManagerDashboardService _dashboardService;

        public ManagerDashboardController(IManagerDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("metrics")]
        public async Task<IActionResult> GetMetrics()
        {
            var result = await _dashboardService.GetMetricsAsync();
            return Ok(result);
        }

        [HttpGet("revenue-by-month")]
        public async Task<IActionResult> GetRevenueByMonth([FromQuery] string range = "12m")
        {
            var result = await _dashboardService.GetRevenueByMonthAsync(range);
            return Ok(result);
        }

        [HttpGet("orders-by-month")]
        public async Task<IActionResult> GetOrdersByMonth([FromQuery] string range = "12m")
        {
            int months = 12;
            if (range.EndsWith("m") && int.TryParse(range.TrimEnd('m'), out int m))
                months = m;

            var result = await _dashboardService.GetOrdersByMonthAsync(months);
            return Ok(result);
        }

        [HttpGet("product-distribution")]
        public async Task<IActionResult> GetProductDistribution()
        {
            var result = await _dashboardService.GetProductDistributionAsync();
            return Ok(result);
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestTransactions()
        {
            var transactions = await _dashboardService.GetLatestTransactionsAsync(10);
            return Ok(transactions);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var result = await _dashboardService.GetPendingApprovalsAsync();
            return Ok(result);
        }

        //[Authorize(Roles = "staff,manager")]
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            int staffId = int.Parse(User.FindFirst("user_id")!.Value);
            await _dashboardService.ApproveAsync(id, staffId);
            return Ok(new { message = "Seller approved successfully." });
        }

        //[Authorize(Roles = "staff,manager")]
        [HttpPatch("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] SellerApprovalUpdateDto dto)
        {
            int staffId = int.Parse(User.FindFirst("user_id")!.Value);
            await _dashboardService.RejectAsync(id, staffId, dto.Note);
            return Ok(new { message = "Seller rejected successfully." });
        }
    }
}
