using Application.DTOs.UserDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Application.DTOs.ReviewDtos;

namespace Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ReviewRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto, int id)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));


            if (_context.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")

            {
                return await CreateReviewInternalAsync(dto, id);
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var response = await CreateReviewInternalAsync(dto, id);
                await transaction.CommitAsync();
                return response;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<ReviewResponseDto> CreateReviewInternalAsync(CreateReviewDto dto, int id)
        {
            var review = new Review
            {
                ReviewerId = id,
                ItemId = dto.ItemId,
                TargetUserId = dto.TargetUserId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.Now,
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
                ReviewDate = review.CreatedAt ?? DateTime.Now,
                UpdateAt = review.UpdatedAt ?? review.CreatedAt ?? DateTime.Now,
                ReviewImages = imageDtos
            };
        }
        public async Task<List<Review>> GetReviewAsync(int itemId)
        {
            return await _context.Reviews
                .Where(r => r.ItemId == itemId).ToListAsync();
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.TargetUserId == targetUserId)
                .ToListAsync();

            if (reviews == null || !reviews.Any())
                return new List<ReviewResponseDto>();

            var reviewIds = reviews.Select(r => r.ReviewId).ToList();

            var images = await _context.ReviewImages
                .Where(img => reviewIds.Contains(img.ReviewId))
                .ToListAsync();

            var result = reviews.Select(r => new ReviewResponseDto
            {
                ReviewerId = r.ReviewerId,
                TargetUserId = r.TargetUserId,
                ItemId = r.ItemId,
                Rating = r.Rating,
                Comment = r.Comment ?? "",
                ReviewDate = r.CreatedAt.HasValue ? r.CreatedAt.Value : DateTime.Now,
                UpdateAt = r.UpdatedAt.HasValue
                           ? r.UpdatedAt.Value
                           : (r.CreatedAt.HasValue ? r.CreatedAt.Value : DateTime.Now),
                ReviewImages = images
                                .Where(img => img.ReviewId == r.ReviewId)
                                .Select(img => new ReviewImageResponseDto
                                {
                                    ReviewId = img.ReviewId,
                                    ImageUrl = img.ImageUrl ?? ""
                                })
                                .ToList()
            }).ToList();

            return result;
        }


        public async Task<IEnumerable<Review>> GetByTargetUserIdAsync(int targetUserId)
        {
            return await _context.Reviews
                .Where(r => r.TargetUserId == targetUserId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(int targetUserId)
        {
            return await _context.Reviews
                .Where(r => r.TargetUserId == targetUserId)
                .Select(r => (double?)r.Rating)
                .AverageAsync() ?? 0.0;
        }

        public async Task<int> GetTotalReviewsAsync(int targetUserId)
        {
            return await _context.Reviews
                .CountAsync(r => r.TargetUserId == targetUserId);
        }

        public async Task<IEnumerable<SellerReviewDto>> GetReviewsBySellerIdAsync(int sellerId)
        {
            var query = from r in _context.Reviews
                        join u in _context.Users on r.ReviewerId equals u.UserId
                        where r.TargetUserId == sellerId
                              && u.IsDeleted == false
                        orderby r.CreatedAt descending
                        select new SellerReviewDto
                        {
                            ReviewId = r.ReviewId,
                            BuyerName = u.FullName,
                            Rating = r.Rating,
                            Comment = r.Comment,
                            CreatedAt = r.CreatedAt
                        };

            return await query.ToListAsync();
        }
    }
}
