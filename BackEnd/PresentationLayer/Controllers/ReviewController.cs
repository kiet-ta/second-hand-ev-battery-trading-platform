using Application.IServices;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Application.DTOs.ReviewDtos;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/review")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            if (dto == null)
                return BadRequest("Review data is required.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var review = await _reviewService.CreateReviewAsync(dto);

            return CreatedAtAction(
                nameof(GetReviewsByTargetUser),
                new { targetUserId = review.TargetUserId },
                review
            );
        }

        [HttpGet("target/{targetUserId:int}")]
        public async Task<IActionResult> GetReviewsByTargetUser(int targetUserId)
        {
            var reviews = await _reviewService.GetReviewsByTargetUserIdAsync(targetUserId);
            return Ok(reviews);
        }

        [HttpGet("item/{itemId:int}")]
        public async Task<IActionResult> GetReviewsByItem(int itemId)
        {
            var reviews = await _reviewService.GetReviewAsync(itemId);
            return Ok(reviews);
        }
    }
}
