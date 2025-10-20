using Application.DTOs;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpPost("approve/{newsId}")]
        public async Task<IActionResult> ApproveNews(int newsId, [FromBody] CreateNotificationDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest(new { message = "Notification content cannot be empty." });

            var isApproved = await _newsService.ApproveNewsAsync(newsId);
            if (!isApproved)
                return NotFound(new { message = "News not found." });

            var notificationAdded = await _notificationService.AddNewNotification(dto);
            Console.WriteLine(notificationAdded
                ? $"Notification added to DB: {dto.Title} -> {dto.Message}"
                : "Failed to add notification to the database.");

            await _notificationService.SendNotificationAsync(dto.Message);
            Console.WriteLine("Notification sent successfully.");

            return Ok(new { message = "News approved and notification sent successfully." });
        }

        [Authorize]
        [HttpGet("subscribe")]
        public async Task Subscribe(CancellationToken ct)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                Response.StatusCode = StatusCodes.Status401Unauthorized;
                await Response.WriteAsync("Unauthorized: User ID not found in token.");
                return;
            }

            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Content-Type", "text/event-stream");
            Response.Headers.Append("Connection", "keep-alive");

            await _notificationService.RegisterClientAsync(Response, ct, userId);
            Console.WriteLine($"User {userId} subscribed for SSE.");

            try
            {
                while (!ct.IsCancellationRequested)
                {
                    await Task.Delay(TimeSpan.FromSeconds(15), ct);
                    await Response.WriteAsync(":\n\n"); 
                    await Response.Body.FlushAsync();
                }
            }
            catch (TaskCanceledException)
            {
            }
            finally
            {
                await _notificationService.UnRegisterClientAsync(Response);
                Console.WriteLine($"User {userId} unsubscribed.");
            }
        }
    }
}
