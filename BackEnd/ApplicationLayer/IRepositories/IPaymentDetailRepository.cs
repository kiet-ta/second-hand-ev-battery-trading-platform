using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IPaymentDetailRepository
    {
        Task<decimal> GetRevenueAsync(int sellerId);
        Task<List<RevenueByMonthDto>> GetRevenueByMonthAsync(int sellerId);
    }
}
