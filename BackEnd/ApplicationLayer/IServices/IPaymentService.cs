using Application.DTOs;
using Application.DTOs.PaymentDtos;
using Net.payOS.Types;
using System.Text.Json;

namespace Application.IServices;

public interface IPaymentService
{

    Task<IEnumerable<UserPaymentDetailHistoryDto>> GetUserPaymentDetailsHistoryAsync(int userId);
    Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request);

    Task<PaymentInfoDto> GetPaymentInfoAsync(long orderCode);

    Task CancelPaymentAsync(long orderCode, PaymentCancelRequestDto request);

    Task HandleWebhookAsync(WebhookType body);

    Task<PaymentResponseDto> CreateSellerRegistrationPaymentAsync(SellerRegistrationPaymentRequestDto request);

    Task<PaymentResponseDto> CreateDepositPaymentLinkAsync(int userId, decimal amount);

    Task<bool> ConfirmOrderAndSplitPaymentAsync(int orderId, int buyerId);

    Task ProcessSuccessfulPaymentAsync(int orderId, string transactionId, decimal amount);

    Task<IEnumerable<PaymentWithDetailsDto>> GetPaymentsDataAsync();

    Task<IEnumerable<PaymentWithDetailsDto>> GetPaymentHistoryByRolesAsync(int buyerId, int? sellerId = null, int? managerId = null);

    Task<DetailedPaymentHistoryDto> GetTransactionDetailByOrder(int userId, int orderId);
}