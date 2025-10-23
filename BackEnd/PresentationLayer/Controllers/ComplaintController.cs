using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ComplaintsController : ControllerBase
    {
        private readonly IComplaintService _complaintService;

        public ComplaintsController(IComplaintService complaintService)
        {
            _complaintService = complaintService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateComplaint([FromBody] CreateComplaintDto dto)
        {
            var complaint = await _complaintService.AddNewComplaint(dto);
            return Ok(new
            {
                message = $"Complaint (ID: {complaint.ComplaintId}) created successfully.",
                complaintId = complaint.ComplaintId,
                status = complaint.Status,
                level = complaint.SeverityLevel
            });
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
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status, [FromQuery] int? assignTo = null)
        {
            await _complaintService.UpdateStatusComplaint(id, status, assignTo);
            return Ok(new
            {
                message = $"Complaint ID {id} status updated to '{status}'.",
                complaintId = id,
                newStatus = status,
                assignedTo = assignTo
            });
        }

        [HttpPatch("{id}/level")]
        public async Task<IActionResult> UpdateLevel(int id, [FromQuery] string level, [FromQuery] int? assignTo = null)
        {
            await _complaintService.UpdateLevelComplaint(id, level, assignTo);
            return Ok(new
            {
                message = $"Complaint ID {id} level updated to '{level}'.",
                complaintId = id,
                newLevel = level,
                assignedTo = assignTo
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComplaint(int id)
        {
            await _complaintService.DeleteComplaint(id);
            return Ok(new
            {
                message = $"Complaint ID {id} deleted successfully.",
                complaintId = id
            });
        }
    }
}
