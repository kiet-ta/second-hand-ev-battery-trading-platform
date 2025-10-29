using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly INotificationService _notificationService;
        private readonly IKYC_DocumentService _kycdocumentService;

        public ReportController(IReportService reportService, INotificationService notificationService, IKYC_DocumentService kycdocumentService)
        {
            _reportService = reportService;
            _notificationService = notificationService;
            _kycdocumentService = kycdocumentService;
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
        [Authorize(Roles = "staff,manager")]
        public async Task<IActionResult> UpdateReportStatus(
           int id,
           [FromQuery] string status,
           [FromQuery] int day,
           [FromBody] CreateNotificationDTO dto)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int senderId))
                return Unauthorized(new { message = "User ID not found or invalid in token." });

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(roleClaim))
                return Unauthorized(new { message = "User role not found in token." });
            string senderRole = roleClaim;

            if (day <= 0)
                return BadRequest(new { message = "Duration (day) must be greater than 0." });

            var report = await _reportService.UpdateReportStatus(id, status, senderId, day);
            if (report == null)
                return NotFound(new { message = "Report not found." });

            if (dto == null || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest(new { message = "Notification content cannot be empty." });

            var notificationAdded = await _notificationService.AddNewNotification(dto, senderId, senderRole);
 
            await _notificationService.SendNotificationAsync(dto.Message);
            Console.WriteLine("Realtime notification sent successfully.");
            if (status == "approved")
            {
                if (!int.TryParse(dto.TargetUserId, out int targetUserId))
                    return BadRequest(new { message = "TargetUserId must be a valid integer." });

               await _kycdocumentService.WarningUserAsync(targetUserId);

                var reports = await _reportService.GetReportByUserId(targetUserId);
                if (reports.Count >= 4)
                    await _kycdocumentService.BanUserAsync(targetUserId);
            }
            return Ok(new
            {
                message = "Report status updated successfully and notification sent.",
                report,
                senderId,
                senderRole
            });
        }


    }
}
