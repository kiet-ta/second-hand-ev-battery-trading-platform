using Application.DTOs;
using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _favoriteService;

        public FavoritesController(IFavoriteService favoriteService)
        {
            _favoriteService = favoriteService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFavorite([FromBody] CreateFavoriteDto dto)
        {
            if (dto == null || dto.UserId <= 0 || dto.ItemId <= 0)
                return BadRequest(new { message = "Invalid favorite data." });

                var result = await _favoriteService.CreateFavoriteAsync(dto);
                return Ok(result);
            
           
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetFavoritesByUser(int userId)
        {
            var result = await _favoriteService.GetFavoritesByUserAsync(userId);
            if (result == null || !result.Any())
                return NotFound(new { message = "No favorites found for this user." });

            return Ok(result);
        }

        [HttpDelete("{favId}")]
        public async Task<IActionResult> DeleteFavorite(int favId)
        {
            if (favId <= 0)
                return BadRequest("Invalid favorite ID.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { message = "Invalid user token." });

            var success = await _favoriteService.DeleteFavoriteAsync(favId, userId);

            if (!success)
                return NotFound(new { message = "Favorite not found or not owned by user." });

            return Ok(new { message = "Favorite deleted successfully." });
        }
    }
}
