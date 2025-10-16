using Application.DTOs.ReviewDtos;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Infrastructure.Repositories
{
    public class Class1
    {
        private readonly EvBatteryTradingContext _context;
        public Class1(EvBatteryTradingContext context)
        {
            _context = context;
        }
        public async Task<ReviewResponseDto> GetReview(CreateReviewDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (_context.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")
            {
                return await GetReviewInternalAsync(dto);
            }
            await using var reviews = await _context.Database.BeginTransactionAsync();
            try
            {
                var response = await GetReviewInternalAsync(dto);
                await reviews.CommitAsync();
                return response;

            }
            catch
            {
                await reviews.RollbackAsync();
                throw;
            }
        }
        private async Task<ReviewResponseDto> GetReviewInternalAsync(CreateReviewDto dto)
        {
            var reviews = new Review
            {
                ReviewerId = dto.ReviewerId,
                ItemId = dto.ItemId,
                TargetUserId = dto.TargetUserId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateOnly.FromDateTime(DateTime.Now),
                UpdatedAt = null

            };
            _context.Reviews.Add(reviews);
            await _context.SaveChangesAsync();
            var images = new List<ReviewImageResponseDto>();
            if (dto.ReviewImages != null && dto.ReviewImages.Any())
            {
                var image = dto.ReviewImages.Select(imgDto => new ReviewImage
                {
                    ReviewId = reviews.ReviewId,
                    ImageUrl = imgDto.ImageUrl
                }).ToList();
                _context.ReviewImages.AddRange(image);
                await _context.SaveChangesAsync();
                images = image.Select(i => new ReviewImageResponseDto
                {
                    ReviewId = i.ReviewId,
                    ImageUrl = i.ImageUrl ?? ""
                }).ToList();
            }

            var response = new ReviewResponseDto
            {
                ReviewerId = reviews.ReviewerId,
                TargetUserId = reviews.TargetUserId,
                ItemId = reviews.ItemId,
                Rating = reviews.Rating,
                Comment = reviews.Comment ?? "",
                ReviewDate = reviews.CreatedAt ?? DateOnly.FromDateTime(DateTime.Now),
                UpdateAt = reviews.UpdatedAt ?? reviews.CreatedAt ?? DateOnly.FromDateTime(DateTime.Now),
                ReviewImages = images
            };
            return response;
        }

        public Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int id)
        {
            var review = _context.Reviews.Where(r => r.TargetUserId == id)
                .Include(r => r.ReviewImages).ToList();
            var response = review.Select(r => new ReviewResponseDto
            {
                TargetUserId = r.TargetUserId,
                ReviewerId = r.ReviewerId,
                ItemId = r.ItemId,
                Rating = r.Rating,
                Comment = r.Comment ?? "",
                ReviewDate = r.CreatedAt ?? DateOnly.FromDateTime(DateTime.Now),
                UpdateAt = r.UpdatedAt ?? r.CreatedAt ?? DateOnly.FromDateTime(DateTime.Now),
                ReviewImages = r.ReviewImages?.Select(ri => new ReviewImageResponseDto
                {
                    ReviewId = ri.ReviewId,
                    ImageUrl = ri.ImageUrl ?? ""
                }).ToList()
            }).ToList();
            return Task.FromResult(response);

        }
    }
}

