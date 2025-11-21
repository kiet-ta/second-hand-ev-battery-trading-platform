using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SellerService : ISellerService
    {

        private readonly IUnitOfWork _unitOfWork;

        public SellerService(IUnitOfWork unitOfWork)
        {
      _unitOfWork = unitOfWork;
        }

        public async Task<SellerProfileDto?> GetSellerProfileAsync(int sellerId)
        {
            if (sellerId <= 0)
                throw new ArgumentException("Seller ID must be greater than zero.", nameof(sellerId));

            var user = await _unitOfWork.Users.GetByIdAsync(sellerId);
            if (user == null)
                throw new KeyNotFoundException($"Seller with ID {sellerId} not found.");

            if (user.Role != UserRole.Seller.ToString())
                throw new InvalidOperationException($"User with ID {sellerId} is not a seller.");

            var shopAddress = await _unitOfWork.Address.GetShopAddressAsync(sellerId)
                ?? throw new Exception("Failed to retrieve shop address.");

            var reviews = await _unitOfWork.Reviews.GetByTargetUserIdAsync(sellerId)
                ?? throw new Exception("Failed to retrieve seller reviews.");

            var items = await _unitOfWork.Items.GetBySellerIdAsync(sellerId)
                ?? throw new Exception("Failed to retrieve seller items.");

            double avgRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;
            return new SellerProfileDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.Phone,
                Address = shopAddress != null ? $"{shopAddress.District}, {shopAddress.Province}" : "null",
                Avatar = user.AvatarProfile ?? "",
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                Rating = Math.Round(avgRating, 1),
                TotalProducts = items.Count(),
                TotalReviews = reviews.Count()
            };
        }

        public async Task<IEnumerable<SellerReviewDto>> GetSellerReviewsAsync(int sellerId)
        {
            if (sellerId <= 0)
                throw new ArgumentException("Seller ID must be greater than zero.", nameof(sellerId));

            var reviews = await _unitOfWork.Reviews.GetReviewsBySellerIdAsync(sellerId);
            if (reviews == null)
                throw new Exception("Failed to retrieve seller reviews.");

            return reviews;
        }
    }
}
