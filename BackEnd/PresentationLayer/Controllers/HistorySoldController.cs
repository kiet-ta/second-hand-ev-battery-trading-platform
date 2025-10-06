using Application.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistorySoldController : ControllerBase
    {
        private readonly IHistorySoldService _historySoldService;

        public HistorySoldController(IHistorySoldService historySoldService)
        {
            _historySoldService = historySoldService;
        }

        // Hàm helper gọn gàng
        private async Task<IActionResult> ExecuteSellerActionAsync(Func<int, Task<List<object>>> action, int sellerId, string notFoundMessage)
        {
            try
            {
                var result = await action(sellerId);
                if (result.Count == 0)
                    return NotFound(new { Message = notFoundMessage });

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        // 1. Lấy danh sách tổng
        [HttpGet("all/{sellerId}")]
        public Task<IActionResult> GetAllSellerItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetAllSellerItemsAsync,
                sellerId,
                "Seller không tồn tại hoặc không có item nào."
            );

        // 2. Lấy danh sách đang xử lý
        [HttpGet("processing/{sellerId}")]
        public Task<IActionResult> GetProcessingItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetProcessingItemsAsync,
                sellerId,
                "Không tìm thấy item nào đang xử lý."
            );

        // 3. Lấy danh sách đang thanh toán
        [HttpGet("pending/{sellerId}")]
        public Task<IActionResult> GetPendingPaymentItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetPendingPaymentItemsAsync,
                sellerId,
                "Không tìm thấy item nào đang thanh toán."
            );

        // 4. Lấy danh sách đã bán
        [HttpGet("sold/{sellerId}")]
        public Task<IActionResult> GetSoldItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetSoldPaymentItemsAsync,
                sellerId,
                "Không tìm thấy item nào đã bán."
            );
    }
}
