using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;

        public UploadController(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile[] files)
        {
            if (files == null || files.Length == 0)
                return BadRequest("No files uploaded");

            var results = new List<object>();

            foreach (var file in files)
            {
                await using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "EV_BATTERY_TRADING/Electric_Verhicle"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                // Check error Cloudinary
                if (uploadResult.Error != null)
                    return BadRequest($"Cloudinary error: {uploadResult.Error.Message}");

                results.Add(new
                {
                    Url = uploadResult.SecureUrl.ToString(),
                    PublicId = uploadResult.PublicId,
                    Thumbnail = _cloudinary.Api.UrlImgUp
                                        .Transform(new Transformation().Width(200).Height(200).Crop("fill"))
                                        .BuildUrl(uploadResult.PublicId)
                });
            }

            return Ok(results);
        }

    }
}
