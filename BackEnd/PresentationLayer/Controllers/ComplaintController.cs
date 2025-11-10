using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/complaints")]
    [Produces("application/json")]
    public class ComplaintsController : ControllerBase
    {
        private readonly IComplaintService _complaintService;
        private readonly IMailService _mailService;

        public ComplaintsController(IComplaintService complaintService, IMailService mailService)
        {
            _complaintService = complaintService;
            _mailService = mailService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new InvalidOperationException("User ID claim is missing or invalid in token.");
            }
            return userId;
        }

        [HttpPost]
        public async Task<IActionResult> CreateComplaint(CreateComplaintDto dto)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);

            var complaint = await _complaintService.AddNewComplaint(dto, userId);
            return Ok(complaint);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetComplaintById(int id)
        {
            var complaint = await _complaintService.GetComplaintById(id);
            return Ok(complaint);
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetByStatus(string status)
        {
            var complaints = await _complaintService.GetComplaintsByStatus(status);
            return Ok(complaints);
        }

        [HttpGet("level/{level}")]
        public async Task<IActionResult> GetByLevel(string level)
        {
            var complaints = await _complaintService.GetComplaintsByLevel(level);
            return Ok(complaints);
        }

        [HttpGet("assignee/{assigneeId}")]
        public async Task<IActionResult> GetByAssignee(int assigneeId)
        {
            var complaints = await _complaintService.GetComplaintsByAssignee(assigneeId);
            return Ok(complaints);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var complaints = await _complaintService.GetComplaintsByUser(userId);
            return Ok(complaints);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);
            if (string.IsNullOrWhiteSpace(status))
                return BadRequest("Status cannot be empty.");

            await _complaintService.UpdateStatusComplaint(id, status, userId);

            return Ok(new
            {
                complaintId = id,
                newStatus = status,
                assignedTo = userId
            });
        }
        [HttpPost("resolve")]
        public async Task<IActionResult> ResolveComlaint([FromBody] CreateResponseMailDto dto)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);


            var staffName = User.FindFirst(ClaimTypes.Name)?.Value;
            var staffRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(staffName))
                return BadRequest("Staff name not found in token.");
            if (string.IsNullOrWhiteSpace(staffRole))
                return BadRequest("Staff role not found in token.");

            if (dto == null)
                return BadRequest("Request body cannot be null.");
            bool mailSent = await _mailService.SendResponseComplaintMailAsync(dto, staffName, staffRole);

            if (mailSent)
            {
                await _complaintService.UpdateStatusComplaint(dto.complaintId, "resolved", userId);
                return Ok(new
                {
                    complaintId = dto.complaintId,
                    newStatus = "resolved",
                    assignedTo = userId
                });
            }
            else
            {
                return StatusCode(500, "Failed to send response email.");
            }
        }


        [HttpPut("{complaintId}/level")]
        public async Task<IActionResult> UpdateLevelComplaint(int complaintId, [FromQuery] string level)
        {
            if (string.IsNullOrWhiteSpace(level))
                return BadRequest("Level cannot be empty.");

            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);
            await _complaintService.UpdateLevelComplaint(complaintId, level, userId);

            return Ok(new
            {
                complaintId,
                message = $"Complaint #{complaintId} level updated successfully.",
                newLevel = level,
                assignedTo = userId
            });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComplaint(int id)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token.");

            int userId = int.Parse(userIdClaim);
            await _complaintService.DeleteComplaint(id, userId);

            return Ok(new
            {
                complaintId = id,
                message = $"Complaint #{id} has been deleted successfully."
            });
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllComplaints()
        {
            var complaints = await _complaintService.GetallComplaint();
            return Ok(complaints);

        }
    } 
}
