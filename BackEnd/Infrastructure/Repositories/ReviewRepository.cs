using Application.DTOs.ReviewDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ReviewRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));


            if (_context.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")

            {
                return await CreateReviewInternalAsync(dto);
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var response = await CreateReviewInternalAsync(dto);
                await transaction.CommitAsync();
                return response;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<ReviewResponseDto> CreateReviewInternalAsync(CreateReviewDto dto)
        {
            var review = new Review
            {
                ReviewerId = dto.ReviewerId,
                ItemId = dto.ItemId,
                TargetUserId = dto.TargetUserId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateOnly.FromDateTime(DateTime.Now),
                UpdatedAt = null
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var imageDtos = new List<ReviewImageResponseDto>();

            if (dto.ReviewImages != null && dto.ReviewImages.Any())
            {
                var images = dto.ReviewImages.Select(imgDto => new ReviewImage
                {
                    ReviewId = review.ReviewId,
                    ImageUrl = imgDto.ImageUrl
                }).ToList();

                _context.ReviewImages.AddRange(images);
                await _context.SaveChangesAsync();

                imageDtos = images.Select(i => new ReviewImageResponseDto
                {
                    ReviewId = i.ReviewId,
                    ImageUrl = i.ImageUrl ?? ""
                }).ToList();
            }

            return new ReviewResponseDto
            {
                ReviewerId = review.ReviewerId,
                TargetUserId = review.TargetUserId,
                ItemId = review.ItemId,
                Rating = review.Rating,
                Comment = review.Comment ?? "",
                ReviewDate = review.CreatedAt ?? DateOnly.FromDateTime(DateTime.Now),
                UpdateAt = review.UpdatedAt ?? review.CreatedAt ?? DateOnly.FromDateTime(DateTime.Now),
                ReviewImages = imageDtos
            };
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.TargetUserId == targetUserId)
                .Include(r => r.ReviewImages)
                .ToListAsync();
            if (reviews == null || !reviews.Any())
                return new List<ReviewResponseDto>();

            var result = reviews.Select(r => new ReviewResponseDto
            {
                ReviewerId = r.ReviewerId,
                TargetUserId = r.TargetUserId,
                ItemId = r.ItemId,
                Rating = r.Rating,
                Comment = r.Comment ?? "",
                ReviewDate = r.CreatedAt.HasValue
                             ? r.CreatedAt.Value
                             : DateOnly.FromDateTime(DateTime.Now),
                UpdateAt = r.UpdatedAt.HasValue
                           ? r.UpdatedAt.Value
                           : (r.CreatedAt.HasValue ? r.CreatedAt.Value : DateOnly.FromDateTime(DateTime.Now)),
                ReviewImages = r.ReviewImages?
                                .Select(img => new ReviewImageResponseDto
                                {
                                    ReviewId = img.ReviewId,
                                    ImageUrl = img.ImageUrl ?? ""
                                })
                                .ToList()
            }).ToList();

            return result;
        }

    }
}
