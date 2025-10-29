using Application.DTOs.PaymentDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
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
    private readonly IWalletRepository _walletRepository;
    private readonly IConfiguration _config;
    private readonly ICommissionFeeRuleRepository _commissionRuleRepo;
    private readonly IUserRepository _userRepository;
    private readonly IItemRepository _itemRepository;

    public PaymentService(PayOS payOS, IPaymentRepository paymentRepository, IWalletRepository walletRepository, IConfiguration config, ICommissionFeeRuleRepository commissionRuleRepo,
    IUserRepository userRepository, IItemRepository itemRepository)
    {
        _payOS = payOS;
        _paymentRepository = paymentRepository;
        _config = config;
        _walletRepository = walletRepository;
        _commissionRuleRepo = commissionRuleRepo;
        _userRepository = userRepository;
        _itemRepository = itemRepository;
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
        await _paymentRepository.UpdatePaymentStatusAsync(info.PaymentId, "failed");
    }

    public async Task HandleWebhookAsync(WebhookType body)
    {
        var data = _payOS.verifyPaymentWebhookData(body);
        if (data.code != "00" || data.desc != "success")
            return;

        var info = await _paymentRepository.GetPaymentInfoByOrderCodeAsync(data.orderCode);
        if (info == null || info.Status == "completed")
            return;

        await _paymentRepository.UpdatePaymentStatusAsync(info.PaymentId, "completed");

        // check in db have registration payment
        bool isRegistrationPayment = info.Details.Count == 1 &&
                                     info.Details.First().ItemId == null &&
                                     info.Details.First().OrderId == null;

        if (isRegistrationPayment)
        {
            var user = await _userRepository.GetByIdAsync(info.UserId);
            if (user != null)
            {
                user.Paid = "registing";
                await _userRepository.UpdateAsync(user);
            }
        }
        else
        {
            await _paymentRepository.UpdateRelatedEntitiesAsync(info.Details);

            // Find seller for sent money
            var firstDetail = info.Details.FirstOrDefault(d => d.ItemId.HasValue);
            if (firstDetail?.ItemId == null) return;

            var item = await _itemRepository.GetByIdAsync(firstDetail.ItemId.Value);
            if (item?.UpdatedBy == null) return;

            int sellerId = item.UpdatedBy.Value;
            var sellerWallet = await _walletRepository.GetWalletByUserIdAsync(sellerId);

            if (sellerWallet != null)
            {
                await _walletRepository.UpdateBalanceAsync(sellerWallet.WalletId, info.TotalAmount);

                var transaction = new WalletTransaction
                {
                    WalletId = sellerWallet.WalletId,
                    Amount = info.TotalAmount,
                    Type = "deposit",
                    RefId = info.PaymentId,
                    CreatedAt = DateTime.UtcNow
                };
                await _walletRepository.AddWalletTransactionAsync(transaction);
            }
        }
    }

    public async Task<PaymentResponseDto> CreateSellerRegistrationPaymentAsync(SellerRegistrationPaymentRequestDto request)
    {
        var rules = await _commissionRuleRepo.GetAllAsync();
        var registrationFeeRule = rules.FirstOrDefault(r => r.FeeCode == "SELLER_REG_FEE" && r.IsActive);
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user.Role != "seller" || user.Paid == "registering" || user.Paid == "account-maintenance-fee")
        {
            //400 (Bad Request)
            throw new InvalidOperationException("User is not a seller or has paid the fee.");
        }
        if (registrationFeeRule == null)
            throw new Exception("Registration fee for Seller not configured yet.");

        var feeAmount = registrationFeeRule.FeeValue;

        // record payment
        long orderCode = long.Parse(DateTimeOffset.UtcNow.ToString("ffffff"));
        var payment = new Payment
        {
            UserId = request.UserId,
            OrderCode = orderCode,
            TotalAmount = feeAmount,
            Method = "payos", // can add option that implement for debute from wallet
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };
        payment = await _paymentRepository.AddPaymentAsync(payment);

        var paymentDetail = new PaymentDetail
        {
            PaymentId = payment.PaymentId,
            Amount = feeAmount,
            ItemId = null,
            OrderId = null
        };
        await _paymentRepository.AddPaymentDetailsAsync(new List<PaymentDetail> { paymentDetail });

        var itemData = new ItemData("Seller registration fee", 1, (int)feeAmount);
        var domain = _config["AppSettings:Domain"] ?? "http://localhost:5173/";

        var paymentData = new PaymentData(
            orderCode,
            (int)feeAmount,
            $"Pay Seller registration fee for User ID: {request.UserId}",
            new List<ItemData> { itemData },
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

    public async Task<PaymentResponseDto> CreateDepositPaymentLinkAsync(int userId, decimal amount)
    {
        //unique id deposit order
        long depositOrderCode = long.Parse(DateTimeOffset.UtcNow.ToString("sfff") + userId.ToString().PadLeft(4, '0')); // Ensures higher uniqueness

        // Create Payment record in DB to track deposit transaction
        var paymentRecord = new Payment
        {
            UserId = userId,
            OrderCode = depositOrderCode,
            TotalAmount = amount,
            Method = "payos",
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        paymentRecord = await _paymentRepository.AddPaymentAsync(paymentRecord);

        // ! Create a PaymentDetail record to mark this as a deposit transaction
        // By not setting OrderId and ItemId
        var depositDetail = new PaymentDetail
        {
            PaymentId = paymentRecord.PaymentId,
            OrderId = null,
            ItemId = null,
            Amount = amount
        };
        await _paymentRepository.AddPaymentDetailsAsync(new List<PaymentDetail> { depositDetail });

        var description = $"Deposit: {userId}";
        var payOSItem = new ItemData(
            name: "Wallet Deposit",
            quantity: 1,
            price: (int)amount
        );

        var domain = _config["AppSettings:Domain"] ?? "http://localhost:5173/";
        var paymentData = new PaymentData(
            orderCode: depositOrderCode,
            amount: (int)amount,
            description: description,
            items: new List<ItemData> { payOSItem },
            cancelUrl: $"{domain}wallet/deposit/cancel?paymentId={paymentRecord.PaymentId}",
            returnUrl: $"{domain}wallet/deposit/success?paymentId={paymentRecord.PaymentId}"
        );

        //using payos to create link
        try
        {
            CreatePaymentResult payOSResult = await _payOS.createPaymentLink(paymentData);

            return new PaymentResponseDto
            {
                PaymentId = paymentRecord.PaymentId,
                OrderCode = payOSResult.orderCode,
                CheckoutUrl = payOSResult.checkoutUrl,
                Status = "pending"
            };
        }
        catch (Exception ex)
        {
            await _paymentRepository.UpdatePaymentStatusAsync(paymentRecord.PaymentId, "failed");
            Console.WriteLine($"Error creating PayOS link for deposit: {ex.Message}");
            throw new Exception("Failed to create payment link. Please try again later.", ex);
        }
    }
}