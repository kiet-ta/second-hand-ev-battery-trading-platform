using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [Route("api/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IUploadService _uploadService;
        private readonly IUserService _userService;
        private readonly IItemImageService _itemImageService;

        public UploadController(IUploadService uploadService, IItemImageService itemImageService, IUserService userService)
        {
            _uploadService = uploadService;
            _itemImageService = itemImageService;
            _userService = userService;
        }

        [HttpGet("avatar/user/{userId}")]
        public async Task<IActionResult> GetAvatar(int userId)
        {
            var avatarUrl = await _userService.GetAvatarAsync(userId);

            return Ok(new
            {
                userId,
                avatarUrl
            });
        }

        [HttpPost("avatar/user")]
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

        [HttpPost("upload/item")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadItemImageRequest request)
        {
            var urls = await _itemImageService.UploadItemImagesAsync(request.ItemId, request.Files);
            return Ok(new { Message = "Upload success", ImageUrls = urls });
        }

        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetItemImages([FromServices] IItemImageRepository repo, int itemId)
        {
            var images = await repo.GetByItemIdAsync(itemId);
            return Ok(images);
        }
    }
}