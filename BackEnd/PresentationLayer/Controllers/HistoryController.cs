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



        [HttpGet("{sellerId}")]
        public async Task<IActionResult> GetAllHistory(int sellerId)
        {
            try
            {
                var seller = await _historySoldService.GetAllSellerItemsAsync(sellerId);
                if (seller == null || seller.Count == 0)
                    return NotFound(new { Message = "Seller không tồn tại hoặc chưa có item nào." });

                return Ok(seller);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}
