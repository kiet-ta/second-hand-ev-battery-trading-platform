using Application.IServices;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api")]
    [ApiController]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;
        private readonly IItemService _itemService;

        public SellerController(ISellerService sellerService, IItemService itemService)
        {
            _sellerService = sellerService;
            _itemService = itemService;
        }

        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetSellerProfile(int sellerId)
        {
            var result = await _sellerService.GetSellerProfileAsync(sellerId);
            if (result == null)
                return NotFound(new { message = "Seller not found or not active." });

            return Ok(result);
        }

        [HttpGet("item/seller/{sellerId}")]
        public async Task<IActionResult> GetSellerItems(int sellerId)
        {
            var items = await _itemService.GetSellerItemsAsync(sellerId);
            if (!items.Any())
                return NotFound(new { message = "Seller has no active items." });

            return Ok(items);
        }

        [HttpGet("{sellerId}/reviews")]
        public async Task<IActionResult> GetSellerReviews(int sellerId)
        {
            var reviews = await _sellerService.GetSellerReviewsAsync(sellerId);
            return Ok(reviews);
        }
    }
}
