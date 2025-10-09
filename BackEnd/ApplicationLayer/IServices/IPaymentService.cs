using Application.DTOs;

namespace Application.IServices;

public interface IPaymentService
{
    Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request);

    Task<PaymentInfoDto> GetPaymentInfoAsync(long orderCode);

    Task CancelPaymentAsync(long orderCode, string reason);
}