using Application.DTOs;
using Application.DTOs.ReviewDtos;
using Application.IServices;
using Application.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/review")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly INotificationService _notificationService;
        private readonly IProfanityCountService _profanityService;
        private readonly IKycDocumentService _kycdocumentService;

        public ReviewsController(
      IReviewService reviewService,
      IProfanityCountService profanityService,
      INotificationService notificationService,
      IKycDocumentService kycdocumentService)
        {
            _reviewService = reviewService;
            _profanityService = profanityService;
            _notificationService = notificationService;
            _kycdocumentService = kycdocumentService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var userClaims = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userClaims) || !int.TryParse(userClaims, out int userId))
                return Unauthorized("User ID not found in token.");

            if (dto == null)
                return BadRequest("Review data is required.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            _profanityService.ProcessMessage(userId, dto.Comment);
            int count = _profanityService.GetUserCount(userId);
            bool containsBadWords = _profanityService.ContainsProfanity(dto.Comment);

            if (containsBadWords)
            {
                CreateNotificationDto notification;

                if (count == 1)
                {
                    notification = new CreateNotificationDto
                    {
                        TargetUserId = userId.ToString(),
                        NotiType = "activities",
                        Title = "Inappropriate Comment",
                        Message = "Warning: You have used inappropriate language in your review.",
                    };
                    return Ok("you had badword in review, dont do it again");
                }
                else 
                {
                    notification = new CreateNotificationDto
                    {
                        TargetUserId = userId.ToString(),
                        NotiType = "activities",
                        Title = "Inappropriate Comment",
                        Message = "You have been banned from comment due to repeated inappropriate language.",
                      
                    };
                    await _kycdocumentService.WarningUserAsync(userId);
                    return Ok("Badword");
                }
                await _notificationService.AddNewNotification(notification, 4, "staff");
                await _notificationService.SendNotificationAsync(notification.Message, userId.ToString());
            }
            var review = await _reviewService.CreateReviewAsync(dto, userId);

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
