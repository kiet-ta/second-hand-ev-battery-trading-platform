using Application.DTOs.PaymentDtos;
using Net.payOS.Types;
using System.Text.Json;

namespace Application.IServices;

public interface IPaymentService
{
    Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request);

    Task<PaymentInfoDto> GetPaymentInfoAsync(long orderCode);

    Task CancelPaymentAsync(long orderCode, string reason);

    Task HandleWebhookAsync(WebhookType body);

    Task<PaymentResponseDto> CreateSellerRegistrationPaymentAsync(SellerRegistrationPaymentRequestDto request);

    Task<PaymentResponseDto> CreateDepositPaymentLinkAsync(int userId, decimal amount);

    Task<bool> ConfirmOrderAndSplitPaymentAsync(int orderId, int buyerId);
}