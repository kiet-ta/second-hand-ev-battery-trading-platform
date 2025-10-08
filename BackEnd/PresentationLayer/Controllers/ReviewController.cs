using Application.DTOs.ReviewDtos;
using Application.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            if (dto == null)
                return BadRequest("Review data is required.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var review = await _reviewService.CreateReviewAsync(dto);
                // Trả về 201 Created + location
                return CreatedAtAction(nameof(GetReviewsByTargetUser),
                    new { targetUserId = review.TargetUserId }, review);
            }
            catch (Exception ex)
            {
                // Có thể log ex.Message vào logger nếu có
                return StatusCode(500, $"An error occurred while creating the review: {ex.Message}");
            }
        }

        // GET: api/reviews/target/{targetUserId}
        [HttpGet("target/{targetUserId}")]
        public async Task<IActionResult> GetReviewsByTargetUser(int targetUserId)
        {
            try
            {
                var reviews = await _reviewService.GetReviewsByTargetUserIdAsync(targetUserId);

                if (reviews == null || reviews.Count == 0)
                    return NotFound("No reviews found for this user.");

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching reviews: {ex.Message}");
            }
        }
    }
}
