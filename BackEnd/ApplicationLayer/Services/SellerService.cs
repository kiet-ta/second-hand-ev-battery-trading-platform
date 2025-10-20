using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SellerService : ISellerService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly IItemRepository _itemRepository;

        public SellerService(
            IUserRepository userRepository,
            IAddressRepository addressRepository,
            IReviewRepository reviewRepository,
            IItemRepository itemRepository)
        {
            _userRepository = userRepository;
            _addressRepository = addressRepository;
            _reviewRepository = reviewRepository;
            _itemRepository = itemRepository;
        }

        public async Task<SellerProfileDto?> GetSellerProfileAsync(int sellerId)
        {
            var user = await _userRepository.GetByIdAsync(sellerId);
            if (user == null || user.Role != "seller")
                return null;

            var shopAddress = await _addressRepository.GetShopAddressAsync(sellerId);
            var reviews = await _reviewRepository.GetByTargetUserIdAsync(sellerId);
            var items = await _itemRepository.GetBySellerIdAsync(sellerId);

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
            return await _reviewRepository.GetReviewsBySellerIdAsync(sellerId);
        }
    }
}
