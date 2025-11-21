using Application.DTOs;
using Application.DTOs.UserDtos;
using Application.IServices;
using Domain.Entities;
using Infrastructure.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IUploadService _uploadService;

        public UserController(IUserService userService, IUploadService uploadService)
        {
            _userService = userService;
            _uploadService = uploadService;
        }

        [HttpGet("{userId}/avatar")]
        public async Task<IActionResult> GetUserAvatar(int userId)
        {
            var avatarUrl = await _userService.GetAvatarAsync(userId);
            if (string.IsNullOrEmpty(avatarUrl))
                return NotFound(new { message = "Avatar not set or user not found." });

            return Ok(new { userId, avatarUrl });
        }

        [HttpPut("me/avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarRequest request)
        {
            if (request.File == null)
                return BadRequest("No file uploaded");

            var idClaim = User.FindFirst("user_id") ?? User.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null)
                return Unauthorized("Invalid token: user ID not found in claims");

            if (!int.TryParse(idClaim.Value, out var userId))
                return BadRequest("Invalid user ID format in token");

            var avatarUrl = await _uploadService.UploadAvatarAsync(userId, request.File);

            return Ok(new
            {
                Message = "Upload success",
                AvatarUrl = avatarUrl
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] User user)
        {
            await _userService.AddUserAsync(user);
            return CreatedAtAction(nameof(Get), new { id = user.UserId }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] User user)
        {
            if (id != user.UserId) return BadRequest();
            await _userService.UpdateUserAsync(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        [HttpPut("{userId}/password")]
        public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordRequestDto request)
        {
        
                await _userService.ChangePasswordAsync(userId, request);
                return Ok(new { message = "Password changed successfully." });
            
            
        }

        [HttpGet]
        [Authorize(Roles = "Manager,Staff")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page <= 0 || pageSize <= 0)
                return BadRequest("Page and PageSize must be greater than 0");

            var result = await _userService.GetAllUsersAsync(page, pageSize);
            return Ok(result);
        }
    }
}