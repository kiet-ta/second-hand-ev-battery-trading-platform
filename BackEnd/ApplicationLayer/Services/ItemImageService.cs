using Application.IRepositories;
using Application.IServices;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ItemImageService : IItemImageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly Cloudinary _cloudinary;

        public ItemImageService(
            IUnitOfWork unitOfWork,
            Cloudinary cloudinary)
        {
            _unitOfWork = unitOfWork;
            _cloudinary = cloudinary;
        }

        public async Task<IEnumerable<string>> UploadItemImagesAsync(int itemId, List<IFormFile> files)
        {
            var item = await _unitOfWork.Items.GetByItemIdAsync(itemId);
            if (item == null)
                throw new Exception($"Item not found with ID = {itemId}");

            var uploadedUrls = new List<string>();

            foreach (var file in files)
            {
                if (file == null || file.Length == 0)
                    continue;

                await using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = $"EV_BATTERY_TRADING/Item"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                    throw new Exception($"Cloudinary error: {uploadResult.Error.Message}");

                var url = uploadResult.SecureUrl.ToString();

                var entity = new ItemImage
                {
                    ItemId = itemId,
                    ImageUrl = url
                };
                await _unitOfWork.Items.AddImageAsync(entity);
                uploadedUrls.Add(url);
            }

            await _unitOfWork.Items.SaveChangesAsync();
            return uploadedUrls;
        }
    }
}
