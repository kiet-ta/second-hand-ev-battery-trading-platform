using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;

        public UploadController(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            await using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "car-market" // ảnh sẽ lưu trong folder này trên Cloudinary
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            return Ok(new
            {
                Url = uploadResult.SecureUrl.ToString(),
                PublicId = uploadResult.PublicId,
                Thumbnail = _cloudinary.Api.UrlImgUp.Transform(new Transformation()
                                .Width(200).Height(200).Crop("fill"))
                                .BuildUrl(uploadResult.PublicId)
            });
        }

    }
}
