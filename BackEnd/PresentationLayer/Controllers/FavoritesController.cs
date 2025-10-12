using Application.DTOs;
using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
                return BadRequest("Invalid favorite data.");

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
    }
}
