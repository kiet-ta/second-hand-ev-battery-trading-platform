using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/notification")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notifications = await _notificationService.GetAllNotificationsAsync();
            return Ok(notifications);
        }


        [HttpGet("register")]
        [AllowAnonymous]
        public async Task RegisterClient([FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                await HttpContext.Response.WriteAsync("User ID is required for SSE registration.");
                return;
            }

            var bufferingFeature = HttpContext.Features.Get<IHttpResponseBodyFeature>();
            if (bufferingFeature != null)
            {
                bufferingFeature.DisableBuffering();
            }

            HttpContext.Response.Headers.CacheControl = "no-cache";
            HttpContext.Response.Headers.Connection = "keep-alive";
            HttpContext.Response.ContentType = "text/event-stream";


            await HttpContext.Response.StartAsync(); 
            Console.WriteLine($"[DEBUG-C#] Headers committed via StartAsync for {userId}.");
            await _notificationService.RegisterClientAsync(
                HttpContext.Response,
                HttpContext.RequestAborted,
                userId
            );
            Console.WriteLine($"[DEBUG-C#] Controller RegisterClient FINISHED executing for {userId}.");
        }


        [HttpPost]
        public async Task<IActionResult> AddNotification([FromBody] CreateNotificationDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int senderId))
                return Unauthorized(new { message = "User ID not found or invalid in token." });


            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(roleClaim))
                return Unauthorized(new { message = "User role not found in token." });
            string senderRole = roleClaim;

            var serviceDto = new CreateNotificationDTO
            {
                NotiType = request.NotiType,
                Title = request.Title,
                Message = request.Message,
                TargetUserId = request.TargetUserId
            };

            var dbSuccess = await _notificationService.AddNewNotification(serviceDto, senderId, roleClaim);

            if (!dbSuccess)
                return StatusCode(500, new { message = "Error saving Notification to database." });

            var ssePayload = new
            {
                id = Guid.NewGuid().ToString(),
                title = request.Title,
                content = request.Message,
                notiType = request.NotiType, // For tab filtering
                type = "general", // For inner filtering
                time = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm")
            };

            string jsonMessage = JsonSerializer.Serialize(ssePayload);

            await _notificationService.SendNotificationAsync(
                message: jsonMessage,
                targetUserId: request.TargetUserId
            );

            return Ok(new { message = "Notification created and dispatched successfully." });
        }

        [HttpGet("receiver/{userId}")]
        public async Task<IActionResult> GetByReceiverId(int userId)
        {
            var notifications = await _notificationService.GetNotificationsByReceiverIdAsync(userId);
            if (notifications == null || notifications.Count == 0)
                return NotFound($"No notifications found for receiver {userId}");

            return Ok(notifications);
        }


        [HttpGet("type/{notiType}")]
        public async Task<IActionResult> GetByNotiType(string notiType)
        {
            var notifications = await _notificationService.GetNotificationByNotiTypeAsync(notiType);
            if (notifications == null || notifications.Count == 0)
                return NotFound($"No notifications found with type '{notiType}'");

            return Ok(notifications);
        }

        [HttpGet("sender/{senderId}")]
        public async Task<IActionResult> GetBySenderId(int senderId)
        {
            var notifications = await _notificationService.GetNotificationBySenderIdAsync(senderId);
            if (notifications == null || notifications.Count == 0)
                return NotFound($"No notifications found from sender {senderId}");

            return Ok(notifications);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var notifications = await _notificationService.GetNotificationByIdAsync(id);
            if (notifications == null )
                return NotFound($"Notification with ID {id} not found");

            return Ok(notifications);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var success = await _notificationService.DeleteNotificationAsync(id);

            if (!success)
                return NotFound($"Notification with ID {id} not found.");

            return Ok($"Notification with ID {id} has been deleted successfully.");
        }
        [HttpPost("send/{receiverId}")]
        public async Task<IActionResult> SendNotification([FromBody] CreateNotificationDTO noti, int receiverId)
        {
            if (noti == null)
                return BadRequest("Notification data is required.");

            var result = await _notificationService.AddNotificationByIdAsync(noti, receiverId, 0, "");


            if (!result)
                return BadRequest("Failed to send notification. Please check receiver ID or data.");

            return Ok(new
            {
                message = "Notification sent successfully",
                receiverId = receiverId,
                title = noti.Title
            });
        }
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var result = await _notificationService.MarkNotificationAsReadAsync(id);
            return Ok(new { message = $"Notification {id} marked as read.", success = result });
        }

        [HttpGet("status/{isRead}")]
        public async Task<IActionResult> GetByReadStatus(bool isRead)
        {
            var notifications = await _notificationService.GetNotificationsByReadStatusAsync(isRead);
            return Ok(notifications);
        }
    }
}
