using Application.DTOs.UserDtos;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Manager")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("count-by-role")]
        public async Task<IActionResult> CountUsersByRole()
        {
            var result = await _userService.GetUsersByRoleAsync();
            return Ok(result);
        }

        [HttpPost("Register")]
        public async Task<IActionResult> AddUser([FromBody] CreateUserDto dto)
        {
            try
            {
                var result = await _userService.AddUserAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
