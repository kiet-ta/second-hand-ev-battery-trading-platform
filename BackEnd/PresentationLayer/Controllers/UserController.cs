using Domain.DTO;
using Microsoft.AspNetCore.Mvc;
using Services;


namespace UserCRUD.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _IUerService;

        public UserController(IUserService IUerService)
        {
            _IUerService = IUerService;
        }

        // GET: api/User (lọc + phân trang DB)
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? role,
            [FromQuery] string? status,
            [FromQuery] string? keyword,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0)
        {
            var filter = new UserFilterParams
            {
                Role = role,
                AccountStatus = status,
                Keyword = keyword
            };

            var users = await _IUerService.GetUsersAsync(filter, limit, offset);
            return Ok(users);
        }

        // GET: api/User/cache (lọc + phân trang + Redis cache)
        [HttpGet("cache")]
        public async Task<IActionResult> GetAllWithCache(
            [FromQuery] string? role,
            [FromQuery] string? status,
            [FromQuery] string? keyword,
            [FromQuery] int limit = 20,
            [FromQuery] int offset = 0)
        {
            var filter = new UserFilterParams
            {
                Role = role,
                AccountStatus = status,
                Keyword = keyword
            };

            var users = await _IUerService.GetUsersWithCacheAsync(filter, limit, offset);
            return Ok(users);
        }

        // GET: api/User/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var users = await _IUerService.GetUsersAsync(new UserFilterParams(), int.MaxValue, 0);
            var user = users.FirstOrDefault(u => u.UserId == id);

            if (user == null)
                return NotFound(new { Message = $"User with id {id} not found" });

            return Ok(user);
        }

        // DELETE: api/User/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                bool success = await _IUerService.DeleteUserAsync(id);
                if (!success)
                    return NotFound(new { Message = $"User with id {id} not found or already deleted" });

                return Ok(new { Message = "User deleted (soft delete)" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Delete failed", Error = ex.Message });
            }
        }

        // PUT: api/User/5 (update thường)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDTO dto)
        {
            if (dto == null)
                return BadRequest(new { Message = "Invalid request body" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _IUerService.UpdateUserAsync(id, dto);

                if (!result)
                    return NotFound(new { Message = $"User with id {id} not found or no changes detected" });

                return Ok(new { Message = "User updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = "Validation failed", Error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Update failed", Error = ex.Message });
            }
        }

        // PUT: api/User/admin/5 (admin update role/status)
        [HttpPut("admin/{id:int}")]
        public async Task<IActionResult> AdminUpdate(int id, [FromBody] AdminUpdateStatusDTO userData)
        {
            if (userData == null)
                return BadRequest(new { Message = "Invalid request body" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                bool success = await _IUerService.AdminUpdateUser(id, userData);
                if (!success)
                    return NotFound(new { Message = $"User with id {id} not found or no valid changes" });

                return Ok(new { Message = "Admin updated user successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = "Validation failed", Error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Admin update failed", Error = ex.Message });
            }
        }
    }
}
