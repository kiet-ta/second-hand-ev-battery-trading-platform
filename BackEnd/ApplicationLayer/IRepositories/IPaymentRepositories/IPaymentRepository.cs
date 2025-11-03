using Application.DTOs.PaymentDtos;
using Domain.Entities;

namespace Application.IRepositories.IPaymentRepositories;

public interface IPaymentRepository
{
    Task<Payment> AddPaymentAsync(Payment payment);

    Task AddPaymentDetailsAsync(List<PaymentDetail> details);

    Task UpdatePaymentStatusAsync(int paymentId, string status);

    Task<PaymentInfoDto> GetPaymentInfoByOrderCodeAsync(long orderCode);

    Task<IEnumerable<(int Year, int Month, decimal Total)>> GetRevenueByMonthAsync(int monthsRange);
    Task<Payment?> GetByOrderIdAsync(int orderId);
}