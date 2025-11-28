using Application.DTOs.ReviewDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ReviewService(IReviewRepository reviewRepository, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto, int id)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Review data cannot be null.");

            if (dto.Rating < 1 || dto.Rating > 5)
                throw new ArgumentException("Rating must be between 1 and 5.");

            if (dto.TargetUserId <= 0)
                throw new ArgumentException("Target user ID is invalid.");

            if (string.IsNullOrWhiteSpace(dto.Comment))
                throw new ArgumentException("Review comment cannot be empty.");

            var result = await _unitOfWork.Reviews.CreateReviewAsync(dto, id);
            if (result == null)
                throw new InvalidOperationException("Failed to create review.");

            return result;
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId)
        {
            if (targetUserId <= 0)
                throw new ArgumentException("Target user ID must be greater than 0.");

            var reviews = await _unitOfWork.Reviews.GetReviewsByTargetUserIdAsync(targetUserId);
            if (reviews == null || reviews.Count == 0)
                throw new KeyNotFoundException("No reviews found for the specified user.");

            return reviews;
        }

        public async Task<List<ReviewResponseDto>> GetReviewAsync(int itemId)
        {
            if (itemId <= 0)
                throw new ArgumentException("Item ID must be greater than 0.");

            var reviews = await _unitOfWork.Reviews.GetReviewAsync(itemId);
            if (reviews == null || reviews.Count == 0)
                throw new KeyNotFoundException("No reviews found for this item.");

            return reviews;
        }
    }
}
