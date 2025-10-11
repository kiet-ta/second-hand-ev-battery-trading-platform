using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
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
                throw new ArgumentException("Số dư wallet không đủ");

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
        throw new ArgumentException("Method không hỗ trợ");
    }

    public async Task<PaymentInfoDto> GetPaymentInfoAsync(long orderCode)
    {
        // Lấy từ DB trước (sử dụng GroupJoin thủ công)
        var info = await _paymentRepository.GetPaymentInfoByOrderCodeAsync(orderCode);
        if (info == null)
            throw new ArgumentException("Payment không tồn tại");

        // Nếu payos, bổ sung info từ PayOS và sync status
        if (info.Method == "payos")
        {
            var payOsInfo = await _payOS.getPaymentLinkInformation(orderCode);
            info.Status = payOsInfo.status;  // Sync status từ PayOS
            // Map thêm fields nếu cần (ví dụ: paymentLinkId)
        }

        return info;
    }

    public async Task CancelPaymentAsync(long orderCode, string reason)
    {
        var info = await GetPaymentInfoAsync(orderCode);  // Reuse để lấy paymentId
        if (info.Method == "payos")
        {
            await _payOS.cancelPaymentLink(orderCode, reason);
        }
        await _paymentRepository.UpdatePaymentStatusAsync(info.PaymentId, "canceled");
        // Optional: Add refund logic cho wallet nếu cần, nhưng theo yêu cầu chỉ cancel
    }
}