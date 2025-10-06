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

        public HistoryController(IItemService itemService)
        {
            _itemService = itemService;
        }

        [HttpGet("bought")]
        [Authorize] // user phải đăng nhập
        public async Task<IActionResult> GetBoughtItems()
        {
            // Lấy claim user_id an toàn
            var userIdClaim = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Token không hợp lệ hoặc thiếu claim user_id.");

            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("user_id trong token không hợp lệ.");

            var result = await _itemService.GetBoughtItemsWithDetailsAsync(userId);
            return Ok(result);
        }
    }
}
