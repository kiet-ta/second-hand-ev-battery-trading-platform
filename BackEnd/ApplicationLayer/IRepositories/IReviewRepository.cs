using Application.DTOs.UserDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.ReviewDtos;

namespace Application.IRepositories
{
    public interface IReviewRepository
    {
        Task<List<Review>> GetReviewAsync(int itemId);
        Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto, int id);
        Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId);
    
        Task<IEnumerable<Review>> GetByTargetUserIdAsync(int targetUserId);

        Task<double> GetAverageRatingAsync(int targetUserId);

        Task<int> GetTotalReviewsAsync(int targetUserId);

        Task<IEnumerable<SellerReviewDto>> GetReviewsBySellerIdAsync(int sellerId);
    }
}
