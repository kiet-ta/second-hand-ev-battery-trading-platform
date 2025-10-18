using Application.IRepositories;
using Application.IServices;
using Domain.DTOs.ReviewDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewService(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return await _reviewRepository.CreateReviewAsync(dto);
        }

        
        public async Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId)
        {
            var reviews = await _reviewRepository.GetReviewsByTargetUserIdAsync(targetUserId);
            return reviews ?? new List<ReviewResponseDto>();
        }
        public async Task<Review> GetReviewAsync(int itemId)
        {
            return await _reviewRepository.GetReviewAsync(itemId);
        }
    }
}
