using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/complaint")]
    [Produces("application/json")]
    public class ComplaintsController : ControllerBase
    {
        private readonly IComplaintService _complaintService;

        public ComplaintsController(IComplaintService complaintService)
        {
            _complaintService = complaintService;
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

        [HttpGet("user/{userId}")]
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

    }
}
