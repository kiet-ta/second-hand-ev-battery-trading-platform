using Application.DTOs;
using Application.IServices;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;
        private readonly INotificationService _notificationService;

        public NewsController(INewsService newsService, INotificationService notificationService)
        {
            _newsService = newsService;
            _notificationService = notificationService;
        }

        [HttpPost("approve/newsId")]
        public async Task<IActionResult> ApproveNews(int newsId, [FromBody] CreateNotificationDTO dto)
        {
            var result = await _newsService.ApproveNewsAsync(newsId);
            if (result)
            {
                var notificationAdded = await _notificationService.AddNewNotification(dto);
                if (!notificationAdded)
                {
                    Console.WriteLine("Failed to add notification to the database.");
                }

                await _notificationService.SendNotificationAsync(dto.Message);

                return Ok(new { message = "News approved and notification sent." });
            }

            return NotFound(new { message = "News not found." });
        }




        //[HttpPost("cancel/{newsId}")]
        //public async Task<IActionResult> CancelNews(int newsId)
        //{
        //    var result = await _newsService.CancelNewsAsync(newsId);
        //    if (result)
        //    {
        //        var notification = new CreateNotificationDTO
        //        {
        //            Title = "News Cancelled",
        //            Message = $"News with ID {newsId} has been cancelled.",
        //            NotiType = "Cancellation",
        //            SenderRole = "Admin",
        //            CreatedAt = DateTime.UtcNow
        //        };

        //        await _notificationService.AddNewNotification(notification);
        //        await _notificationService.SendNotificationAsync(notification.Message);

        //        return Ok(new { message = "News cancelled and notification sent." });
        //    }

        //    return NotFound(new { message = "News not found." });
        //}

        [HttpGet("subscribe")]
        public async Task Subscribe(CancellationToken ct)
        {

            await _notificationService.RegisterClientAsync(Response, ct);
        }   

    }
}
