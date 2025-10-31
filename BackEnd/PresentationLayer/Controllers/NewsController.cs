using Application.DTOs;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Reactive.Subjects;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/news")]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;
        private readonly INotificationService _notificationService;

        public NewsController(INewsService newsService, INotificationService notificationService)
        {
            _newsService = newsService;
            _notificationService = notificationService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllNews([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page <= 0 || pageSize <= 0)
                return BadRequest("Page and PageSize must be greater than 0");
            
            var news = await _newsService.GetAllNewsAsync(page, pageSize);
            return Ok(news);
        }

        [HttpGet("{newId}")]
        public async Task<IActionResult> GetNewsById(int id)
        {
            if (id <= 0) return BadRequest("newsId must be greater than 0");
            var newsDetail = await _newsService.GetNewsById(id);
            return Ok(newsDetail);
        }

        [HttpPost("approve/{newsId}")]
        public async Task<IActionResult> ApproveNews(int newsId, [FromBody] CreateNotificationDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest(new { message = "Notification content cannot be empty." });

            var isApproved = await _newsService.ApproveNewsAsync(newsId);
            if (!isApproved)
                return NotFound(new { message = "News not found." });

            var notificationAdded = await _notificationService.AddNewNotification(dto, 0, "");
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


            while (!ct.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(15), ct);
                await Response.WriteAsync(":\n\n");
                await Response.Body.FlushAsync();
            }

        }
        [HttpPost]
        public async Task<IActionResult> AddNews([FromBody] CreateNewsDto dto)
        {
            if (dto == null)
                return BadRequest("News data cannot be null.");

            var result = await _newsService.AddNewsAsync(dto);
            if (result)
                return Ok(new { message = "News created successfully." });

            return StatusCode(500, "Failed to create news.");
        }

        [HttpDelete("{newsId:int}")]
        public async Task<IActionResult> DeleteNews(int newsId)
        {
            await _newsService.DeleteNewsAsync(newsId);
            return Ok(new { message = $"News with ID {newsId} has been deleted" });
        }
        [HttpPut("reject/{newsId:int}")]
        public async Task<IActionResult> RejectNews(int newsId)
        {
            var result = await _newsService.RejectNewsAsync(newsId);
            if (!result)
                return NotFound(new { message = "News not found" });

            return Ok(new { message = $"News ID {newsId} has been rejected." });
        }
    }
}
