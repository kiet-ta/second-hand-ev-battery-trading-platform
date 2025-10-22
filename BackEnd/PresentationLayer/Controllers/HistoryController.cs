using Application.DTOs.ItemDtos;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

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
        public async Task<IActionResult> GetBoughtItems([FromQuery] PaginationParams paginationParams)
        {
            // get claim user_id safe
            var userIdClaim = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Token invalid claim user_id.");

            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("user_id in token invalid.");

            var result = await _itemService.GetBoughtItemsWithDetailsAsync(userId, paginationParams);
            return Ok(result);
        }



        [HttpGet("{sellerId}")]
        public async Task<IActionResult> GetAllHistory(int sellerId, [FromQuery] PaginationParams pagination)
        {
           
                var seller = await _historySoldService.GetAllSellerItemsAsync(sellerId, pagination);
                if (seller == null || seller.TotalCount == 0)
                    return NotFound(new { Message = "Seller không tồn tại hoặc chưa có item nào." });

            Response.Headers.Append("X-Pagination", JsonSerializer.Serialize(new
            {
                seller.TotalCount,
                seller.PageSize,
                seller.CurrentPage,
                seller.TotalPages
            }));

            return Ok(seller);


        }
    }
}
