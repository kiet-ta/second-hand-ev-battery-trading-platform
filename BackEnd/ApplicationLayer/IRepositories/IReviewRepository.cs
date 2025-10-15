using Application.DTOs.UserDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Review>> GetByTargetUserIdAsync(int targetUserId);

        Task<double> GetAverageRatingAsync(int targetUserId);

        Task<int> GetTotalReviewsAsync(int targetUserId);

        Task<IEnumerable<SellerReviewDto>> GetReviewsBySellerIdAsync(int sellerId);
    }
}
