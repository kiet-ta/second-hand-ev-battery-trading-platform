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
