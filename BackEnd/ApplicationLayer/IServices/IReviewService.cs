using Application.DTOs.ReviewDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IReviewService
    {
        Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto);
        Task<List<ReviewResponseDto>> GetReviewsByTargetUserIdAsync(int targetUserId);    }
}
