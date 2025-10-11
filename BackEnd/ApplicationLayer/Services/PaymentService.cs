using Application.DTOs.PaymentDtos;
using Application.IRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;
using Net.payOS;
using Net.payOS.Types;

namespace Application.Services;

public class PaymentService : IPaymentService
{
    private readonly PayOS _payOS;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IConfiguration _config;

    public PaymentService(PayOS payOS, IPaymentRepository paymentRepository, IConfiguration config)
    {
        _payOS = payOS;
        _paymentRepository = paymentRepository;
        _config = config;
    }

    public async Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request)
    {
        // Validate total
        if (request.TotalAmount != request.Details.Sum(d => d.Amount))
            throw new ArgumentException("Total amount does not match details");

        var wallet = await _paymentRepository.GetWalletByUserIdAsync(request.UserId);
        if (wallet == null)
            throw new ArgumentException("User or wallet does not exist");

        long orderCode = long.Parse(DateTimeOffset.UtcNow.ToString("ffffff"));

        var payment = new Payment
        {
            UserId = request.UserId,
            OrderCode = orderCode,
            TotalAmount = request.TotalAmount,
            Method = request.Method,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        payment = await _paymentRepository.AddPaymentAsync(payment);

        var paymentDetails = request.Details.Select(d => new PaymentDetail
        {
            PaymentId = payment.PaymentId,
            OrderId = d.OrderId,
            ItemId = d.ItemId,
            Amount = d.Amount
        }).ToList();
        await _paymentRepository.AddPaymentDetailsAsync(paymentDetails);

        if (request.Method == "wallet")
        {
            if (wallet.Balance < request.TotalAmount)
                throw new ArgumentException("Insufficient wallet balance");

            await _paymentRepository.DeductWalletBalanceAsync(wallet, request.TotalAmount, payment.PaymentId);
            await _paymentRepository.UpdatePaymentStatusAsync(payment.PaymentId, "completed");
            await _paymentRepository.UpdateRelatedEntitiesAsync(request.Details);

            return new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                OrderCode = orderCode,
                Status = "completed"
            };
        }
        else if (request.Method == "payos")
        {
            var items = request.Details.Select(d => new ItemData(
                d.OrderId.HasValue ? $"Order {d.OrderId.Value}" : $"Item {d.ItemId.Value}",
                1,
                (int)d.Amount  // Cast to int, adjust if amount large (ex: multiply 100 if precision)
            )).ToList();

            var domain = _config["AppSettings:Domain"] ?? "http://localhost:5173/";
            var paymentData = new PaymentData(
                orderCode,
                (int)request.TotalAmount,
                $"payment for user {request.UserId}",
                items,
                $"{domain}payment/fail?paymentId={payment.PaymentId}",
                $"{domain}payment/success?paymentId={payment.PaymentId}"
            );

            var result = await _payOS.createPaymentLink(paymentData);

            return new PaymentResponseDto
            {
                PaymentId = payment.PaymentId,
                OrderCode = result.orderCode,
                CheckoutUrl = result.checkoutUrl,
                Status = "pending"
            };
        }
        throw new ArgumentException("Method not supported");
    }

    public async Task<PaymentInfoDto> GetPaymentInfoAsync(long orderCode)
    {
        var info = await _paymentRepository.GetPaymentInfoByOrderCodeAsync(orderCode);
        if (info == null)
            throw new ArgumentException("Payment does not exist");

        if (info.Method == "payos")
        {
            var payOsInfo = await _payOS.getPaymentLinkInformation(orderCode);
            info.Status = payOsInfo.status;
        }

        return info;
    }

    public async Task CancelPaymentAsync(long orderCode, string reason)
    {
        var info = await GetPaymentInfoAsync(orderCode);
        if (info.Method == "payos")
        {
            await _payOS.cancelPaymentLink(orderCode, reason);
        }
        await _paymentRepository.UpdatePaymentStatusAsync(info.PaymentId, "canceled");
    }

    public async Task HandleWebhookAsync(WebhookType body)
    {
        var data = _payOS.verifyPaymentWebhookData(body);
        if (data.code != "00" || data.desc != "success")
            return;

        var info = await _paymentRepository.GetPaymentInfoByOrderCodeAsync(data.orderCode);
        if (info != null)
        {
            await _paymentRepository.UpdatePaymentStatusAsync(info.PaymentId, "completed");
            await _paymentRepository.UpdateRelatedEntitiesAsync(info.Details);
        }
    }
}