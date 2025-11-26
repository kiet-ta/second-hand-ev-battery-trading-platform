using Application.DTOs;
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
        Task<decimal> GetRevenueAsync(int sellerId);
        Task<List<RevenueByWeekDto>> GetRevenueByWeekAsync(int sellerId);
        Task AddPaymentDetailAsync(PaymentDetail obj);
        Task<PaymentDetail> GetByOrderIdAsync(int orderId);

        Task<PaymentDetail> RemoveOrderAsync(int paymentDetailId);
    }
}
