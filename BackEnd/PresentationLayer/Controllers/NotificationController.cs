using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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


        [HttpGet("receiver/{receiverId}")]
        public async Task<IActionResult> GetByReceiverId(int receiverId)
        {
            var notifications = await _notificationService.GetNotificationsByReceiverIdAsync(receiverId);
            if (notifications == null || notifications.Count == 0)
                return NotFound($"No notifications found for receiver {receiverId}");

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
            if (notifications == null || notifications.Count == 0)
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
        [HttpPost]
        public async Task<IActionResult> AddNotification([FromBody] CreateNotificationDTO dto)
        {
            try
            {
                var notifications = await _notificationService.AddNewNotification(dto);
                if (notifications == false)
                    return NotFound(new { message = "Error creating new Notification" });

                return Ok(new { message = "Notification created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the notification", details = ex.Message });
            }
        }
        [HttpPost("send/{receiverId}")]
        public async Task<IActionResult> SendNotification([FromBody] CreateNotificationDTO noti, int receiverId)
        {
            if (noti == null)
                return BadRequest("Notification data is required.");

            var result = await _notificationService.SendNotificationAsync(noti, receiverId);

            if (!result)
                return BadRequest("Failed to send notification. Please check receiver ID or data.");

            return Ok(new
            {
                message = "Notification sent successfully",
                receiverId = receiverId,
                title = noti.Title
            });
        }

    }
}
