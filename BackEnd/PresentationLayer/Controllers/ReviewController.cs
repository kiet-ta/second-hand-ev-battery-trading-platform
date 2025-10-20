using Application.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Application.DTOs.ReviewDtos;

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

                return CreatedAtAction(nameof(GetReviewsByTargetUser),
                    new { targetUserId = review.TargetUserId }, review);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while creating the review: {ex.Message}");
            }
        }

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
        [HttpGet("exists/item/{itemId}")]
        public async Task<IActionResult> ReviewExists(int itemId)
        {
            try
            {
                var exists = await _reviewService.GetReviewAsync(itemId);

                return Ok(new { ItemId = itemId, Exists = exists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while checking review existence: {ex.Message}");
            }
        }

    }
}
