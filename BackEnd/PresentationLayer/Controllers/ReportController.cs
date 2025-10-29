using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly INotificationService _notificationService;

        public ReportController(IReportService reportService, INotificationService notificationService)
        {
            _reportService = reportService;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _reportService.GetAllReport();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var report = await _reportService.GetReportById(id);
            return Ok(report);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReportByUserId(int userId)
        {
            var reports = await _reportService.GetReportByUserId(userId);
            return Ok(reports);
        }

        [HttpGet("assignee/{assigneeId}")]
        public async Task<IActionResult> GetReportByAssigneeId(int assigneeId)
        {
            var reports = await _reportService.GetReportByAssigneeId(assigneeId);
            return Ok(reports);
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetReportByStatus(string status)
        {
            var reports = await _reportService.GetReportByStatus(status);
            return Ok(reports);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid report data." });

            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (userIdClaim == null)
                return Unauthorized(new { message = "User ID not found in token." });

            int assigneeTo = int.Parse(userIdClaim);
            var report = await _reportService.CreateReport(dto, assigneeTo);

            return CreatedAtAction(nameof(GetReportById), new { id = report.Id }, report);
        }
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateReportStatus(int id, [FromQuery] string status, [FromBody] CreateNotificationDTO dto)
        {
            //var userIdClaim = User.FindFirst("user_id")?.Value;
            //if (string.IsNullOrEmpty(userIdClaim))
            //    return Unauthorized(new { message = "User ID not found in token." });

            //if (!int.TryParse(userIdClaim, out int senderId))
            //    return Unauthorized(new { message = "Invalid User ID in token." });
            //var roleClaim = User.FindFirst("role")?.Value;
            //if (string.IsNullOrEmpty(roleClaim))
            //    return Unauthorized(new { message = "User role not found in token." });

            //string senderRole = roleClaim;

            //var report = await _reportService.UpdateReportStatus(id, status, senderId);
            //if (report == null)
            //    return NotFound(new { message = "Report not found." });

            if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest(new { message = "Notification content cannot be empty." });

            //var notificationAdded = await _notificationService.AddNewNotification(dto, senderId, senderRole);

            //Console.WriteLine(notificationAdded
            //    ? $"Notification added to DB: {dto.Title} -> {dto.Message}"
            //    : "Failed to add notification to the database.");

            await _notificationService.SendNotificationAsync(dto.Message);
            Console.WriteLine("Realtime notification sent successfully.");

            return Ok(new
            {
                message = "Report status updated successfully and notification sent.",
                //report,
                //senderId,
                //senderRole
            });
        }

    }
}
