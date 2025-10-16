using Application.DTOs.UserDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface ISellerService
    {
        Task<SellerProfileDto?> GetSellerProfileAsync(int sellerId);

        Task<IEnumerable<SellerReviewDto>> GetSellerReviewsAsync(int sellerId);
    }
}
