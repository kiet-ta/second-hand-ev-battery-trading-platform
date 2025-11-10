using Application.IRepositories;
using Application.IServices;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Application.Services
{
    public class UploadService : IUploadService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IUnitOfWork _unitOfWork;

        public UploadService(Cloudinary cloudinary, IUnitOfWork unitOfWork)
        {
            _cloudinary = cloudinary;
            _unitOfWork = unitOfWork;
        }

        public async Task<string> UploadAvatarAsync(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File is empty");

            await using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "EV_BATTERY_TRADING/Avatars"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                throw new Exception($"Cloudinary error: {uploadResult.Error.Message}");

            string avatarUrl = uploadResult.SecureUrl.ToString();

            await _unitOfWork.Users.UpdateAvatarAsync(userId, avatarUrl);
            await _unitOfWork.Users.SaveChangesAsync();

            return avatarUrl;
        }
    }
}
