using Domain.DTOs.ReviewDtos;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

           
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
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
                    var images = new List<ReviewImage>();

                    foreach (var imgDto in dto.ReviewImages)
                    {
                        var image = new ReviewImage
                        {
                            ReviewId = review.ReviewId,
                            ImageUrl = imgDto.ImageUrl
                        };

                        images.Add(image);
                    }

                    _context.ReviewImages.AddRange(images);
                    await _context.SaveChangesAsync();

                    imageDtos = images.Select(i => new ReviewImageResponseDto
                    {
                        ReviewId = i.ReviewId,
                        ImageUrl = i.ImageUrl ?? ""
                    }).ToList();
                }

                await transaction.CommitAsync();

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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }






        public async Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.TargetUserId == targetUserId)
                .Include(r => r.ReviewImages)
                .ToListAsync();

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
