using Application.DTOs.ManageStaffDtos;
using Application.IServices;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[Route("api/management")]
[ApiController]
[Authorize(Roles = "manager")]
public class StaffManagementController : ControllerBase
{
    private readonly IStaffManagementService _staffManagementService;

    public StaffManagementController(IStaffManagementService staffManagementService)
    {
        _staffManagementService = staffManagementService;
    }

    [HttpPost("staff")]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffRequestDto request)
    {
        var newUser = await _staffManagementService.CreateStaffAccountAsync(request);
        var responseUser = new // Custom DTO to hide PasswordHash
        {
            newUser.UserId,
            newUser.FullName,
            newUser.Email,
            newUser.Phone,
            newUser.Role,
            newUser.AccountStatus,
            newUser.CreatedAt
        };
        return CreatedAtAction(nameof(GetStaffPermissions), new { staffId = newUser.UserId }, newUser);
    }

    [HttpPost("staff/{staffId}/permissions")]
    public async Task<IActionResult> AssignPermissions(int staffId, [FromBody] List<int> permissionIds)
    {
        await _staffManagementService.AssignPermissionsToStaffAsync(staffId, permissionIds);
        return Ok(new { message = "Permissions updated successfully." });
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> GetAllPermissions()
    {
        var permissions = await _staffManagementService.GetAllPermissionsAsync();
        return Ok(permissions);
    }

    [HttpGet("staff/{staffId}/permissions")]
    public async Task<IActionResult> GetStaffPermissions(int staffId)
    {
        try
        {
            var permissions = await _staffManagementService.GetPermissionsByStaffIdAsync(staffId);
            return Ok(permissions);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}