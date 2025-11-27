using Application.DTOs;
using Application.DTOs.PaymentDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories.IPaymentRepositories
{
    public interface IPaymentDetailRepository
    {
        Task<IEnumerable<UserPaymentDetailHistoryDto>> GetPaymentDetailsByUserIdAsync(int userId);
        Task<decimal> GetRevenueAsync(int sellerId);
        Task<List<RevenueByWeekDto>> GetRevenueByWeekAsync(int sellerId);
        Task AddPaymentDetailAsync(PaymentDetail obj);
        Task<PaymentDetail> GetByOrderIdAsync(int orderId);

        Task<PaymentDetail> RemoveOrderAsync(int paymentDetailId);
        Task CreatePaymentDetailAsync(PaymentDetail paymentDetail);
    }
}
