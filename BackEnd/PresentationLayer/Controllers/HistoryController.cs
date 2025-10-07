using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoryController : ControllerBase
    {
        private readonly IItemService _itemService;
        private readonly IHistorySoldService _historySoldService;

        public HistoryController(IItemService itemService, IHistorySoldService historySoldService)
        {
            _itemService = itemService;
            _historySoldService = historySoldService;
        }

        [HttpGet("bought")]
        [Authorize] // user login
        public async Task<IActionResult> GetBoughtItems()
        {
            // get claim user_id safe
            var userIdClaim = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Token invalid claim user_id.");

            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("user_id in token invalid.");

            var result = await _itemService.GetBoughtItemsWithDetailsAsync(userId);
            return Ok(result);
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

        // 1. Get All Seller Items
        [HttpGet("all/{sellerId}")]
        public Task<IActionResult> GetAllSellerItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetAllSellerItemsAsync,
                sellerId,
                "Seller does not exist or no items available."
            );

        // 2. Get Processing Items
        [HttpGet("processing/{sellerId}")]
        public Task<IActionResult> GetProcessingItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetProcessingItemsAsync,
                sellerId,
                "No items found being processed."
            );

        // 3. Get Pending Payment Items
        [HttpGet("pending/{sellerId}")]
        public Task<IActionResult> GetPendingPaymentItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetPendingPaymentItemsAsync,
                sellerId,
                "No items found for checkout."
            );

        // 4. Get Sold Items
        [HttpGet("sold/{sellerId}")]
        public Task<IActionResult> GetSoldItems(int sellerId) =>
            ExecuteSellerActionAsync(
                _historySoldService.GetSoldPaymentItemsAsync,
                sellerId,
                "No items found for sale."
            );
    }
}
