using Application.DTOs.PaymentDtos;
using Application.IHelpers;
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
    private readonly IConfiguration _config;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUniqueIDGenerator _uniqueIDGenerator;

    public PaymentService(
        PayOS payOS,
        IConfiguration config,
        IUniqueIDGenerator uniqueIDGenerator,
        IUnitOfWork unitOfWork
        )
    {
        _payOS = payOS;
        _config = config;
        _uniqueIDGenerator = uniqueIDGenerator;
        _unitOfWork = unitOfWork;
    }

    // Once the order is completed, the money will be divided between the MANAGER and the SELLER.
    public async Task<bool> ConfirmOrderAndSplitPaymentAsync(int orderId, int buyerId)
    {
        try
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);

            // Validation
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng.");
            if (order.BuyerId != buyerId)
                throw new Exception("Bạn không phải chủ đơn hàng này.");

            if (order.Status != "shipped")
                throw new Exception($"Không thể xác nhận đơn hàng ở trạng thái: {order.Status}.");

            var orderItems = await _unitOfWork.OrderItems.GetByOrderIdAsync(orderId);
            if (orderItems == null || !orderItems.Any())
                throw new Exception("Đơn hàng không có sản phẩm.");

            var firstItem = await _unitOfWork.Items.GetByIdAsync(orderItems.First().ItemId);
            if (firstItem == null)
                throw new Exception("Không tìm thấy sản phẩm.");

            int? sellerId = firstItem.UpdatedBy;
            decimal totalOrderAmount = orderItems.Sum(oi => oi.Price * oi.Quantity);

            await _unitOfWork.BeginTransactionAsync();

            var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
            var managerWallet = await _unitOfWork.Wallets.GetManagerWalletAsync();

            if (sellerWallet == null)
                throw new Exception($"Không tìm thấy ví cho Seller (ID: {sellerId}).");

            string feeCode = "FEE001";
            var commissionRule = await _unitOfWork.CommissionFeeRules.GetActiveRuleByCodeAsync(feeCode); // Hard Core
            if (commissionRule == null)
                throw new Exception("Không tìm thấy quy tắc hoa hồng 'FEE001'.");

            decimal commissionAmount = 0;
            if (commissionRule.FeeType == "percentage")
            {
                commissionAmount = totalOrderAmount * (commissionRule.FeeValue / 100);
            }
            else
            {
                commissionAmount = commissionRule.FeeValue;
            }

            decimal netAmountForSeller = totalOrderAmount - commissionAmount;

            sellerWallet.Balance += netAmountForSeller;
            sellerWallet.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Wallets.Update(sellerWallet);

            managerWallet.Balance += commissionAmount;
            managerWallet.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Wallets.Update(managerWallet);

            order.Status = "completed";
            order.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Orders.UpdateAsync(order);

            var sellerTransaction = new WalletTransaction
            {
                WalletId = sellerWallet.WalletId,
                Amount = netAmountForSeller,
                Type = "release",
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.WalletTransactions.AddAsync(sellerTransaction);

            var managerTransaction = new WalletTransaction
            {
                WalletId = managerWallet.WalletId,
                Amount = commissionAmount,
                Type = "payment",
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.WalletTransactions.AddAsync(managerTransaction);

            await _unitOfWork.SaveChangesAsync();

            var commissionLog = new TransactionCommission
            {
                TransactionId = managerTransaction.TransactionId,
                RuleId = commissionRule.RuleId,
                AppliedValue = commissionAmount,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.TransactionCommission.AddAsync(commissionLog);

            await _unitOfWork.CommitTransactionAsync();

            return true;
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw; 
        }
    }

    public async Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request)
    {
        // Validate total
        if (request.TotalAmount != request.Details.Sum(d => d.Amount))
            throw new ArgumentException("Total amount does not match details");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(request.UserId);
            if (wallet == null)
                throw new ArgumentException("User or wallet does not exist");

            long orderCode = _uniqueIDGenerator.CreateUnique53BitId();

            var payment = new Payment
            {
                UserId = request.UserId,
                OrderCode = orderCode,
                TotalAmount = request.TotalAmount,
                Method = request.Method,
                Status = "pending",
                PaymentType = "order_purchase",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            payment = await _unitOfWork.Payments.AddPaymentAsync(payment);

            await _unitOfWork.SaveChangesAsync(); // save to avoid duplicate primary key

            var paymentDetails = request.Details.Select(d => new PaymentDetail
            {
                PaymentId = payment.PaymentId,
                OrderId = d.OrderId,
                ItemId = d.ItemId,
                Amount = d.Amount
            }).ToList();
            // Add PaymentDetails not save
            await _unitOfWork.Payments.AddPaymentDetailsAsync(paymentDetails);

            if (request.Method == "wallet")
            {
                if (wallet.Balance < request.TotalAmount)
                    throw new ArgumentException("Insufficient wallet balance");

                wallet.Balance -= request.TotalAmount;
                wallet.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Wallets.UpdateBalanceAsync(wallet.WalletId, -request.TotalAmount);

                var walletTransaction = new WalletTransaction
                {
                    WalletId = wallet.WalletId,
                    Amount = -request.TotalAmount,
                    Type = "payment",
                    RefId = payment.PaymentId,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(walletTransaction);

                await _unitOfWork.Payments.UpdatePaymentStatusAsync(payment.PaymentId, "completed");

                await UpdateRelatedEntitiesInternalAsync(request.Details);

                await _unitOfWork.CommitTransactionAsync();

                return new PaymentResponseDto
                {
                    PaymentId = payment.PaymentId,
                    OrderCode = orderCode,
                    Status = "completed"
                };
            }
            else if (request.Method == "payos")
            {
                // only save Payment and PaymentDetails, not "touch" wallet
                await _unitOfWork.CommitTransactionAsync();

                var items = request.Details.Select(d => new ItemData(
                    d.OrderId.HasValue ? $"Order {d.OrderId.Value}" : $"Item {d.ItemId.Value}",
                    1,
                    (int)d.Amount
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
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<PaymentInfoDto> GetPaymentInfoAsync(long orderCode)
    {
        var info = await _unitOfWork.Payments.GetPaymentInfoByOrderCodeAsync(orderCode);
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

        await _unitOfWork.Payments.UpdatePaymentStatusAsync(info.PaymentId, "failed");
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task HandleWebhookAsync(WebhookType body)
    {
        var data = _payOS.verifyPaymentWebhookData(body);
        if (data.code != "00" || data.desc != "success")
            return;

        var info = await _unitOfWork.Payments.GetPaymentInfoByOrderCodeAsync(data.orderCode);
        if (info == null || info.Status == "completed")
        {
            Console.WriteLine($"[Webhook] Bỏ qua, đơn hàng đã xử lý: {data.orderCode}");
            return;
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            await _unitOfWork.Payments.UpdatePaymentStatusAsync(info.PaymentId, "completed");

            bool isSimplePayment = info.Details.Count == 1 &&
                                     info.Details.First().ItemId == null &&
                                     info.Details.First().OrderId == null;

            if (isSimplePayment)
            {
                var rules = await _unitOfWork.CommissionFeeRules.GetAllAsync();
                var registrationFeeRule = rules.FirstOrDefault(r => r.FeeCode == "SELLER_REG_FEE" && r.IsActive);

                if (registrationFeeRule != null && info.TotalAmount == registrationFeeRule.FeeValue)
                {
                    Console.WriteLine($"[Webhook] Xử lý Phí Đăng ký Seller cho PaymentId: {info.PaymentId}");
                    var user = await _unitOfWork.Users.GetByIdAsync(info.UserId);
                    if (user != null)
                    {
                        user.Paid = "registing";
                        await _unitOfWork.Users.UpdateAsync(user);
                    }
                }
                else
                {
                    Console.WriteLine($"[Webhook] Xử lý Nạp tiền (Deposit) cho PaymentId: {info.PaymentId}");

                    var userWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(info.UserId);
                    if (userWallet == null)
                        throw new Exception($"Không tìm thấy ví cho UserId: {info.UserId}");

                    await _unitOfWork.Wallets.UpdateBalanceAsync(userWallet.WalletId, info.TotalAmount);

                    var transaction = new WalletTransaction
                    {
                        WalletId = userWallet.WalletId,
                        Amount = info.TotalAmount,
                        Type = "deposit",
                        RefId = info.PaymentId, 
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.WalletTransactions.CreateTransactionAsync(transaction);
                }
            }
            else if (info.Details.Any(d => d.Amount > 0))
            {
                Console.WriteLine($"[Webhook] Xử lý Mua hàng (Escrow) cho PaymentId: {info.PaymentId}");

                await UpdateRelatedEntitiesInternalAsync(info.Details);

                if (!int.TryParse(_config["AppSettings:SystemWalletUserId"], out int systemWalletUserId))
                    throw new Exception("SystemWalletUserId is not configured");

                var systemWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(systemWalletUserId);
                if (systemWallet == null)
                    throw new Exception($"System Wallet (UserId: {systemWalletUserId}) not found.");

                await _unitOfWork.Wallets.UpdateBalanceAsync(systemWallet.WalletId, info.TotalAmount);

                var transaction = new WalletTransaction
                {
                    WalletId = systemWallet.WalletId,
                    Amount = info.TotalAmount,
                    Type = "hold",
                    RefId = info.PaymentId,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(transaction);
            }

            await _unitOfWork.CommitTransactionAsync();
            Console.WriteLine($"[Webhook] Xử lý thành công PaymentId: {info.PaymentId}");
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            Console.WriteLine($"[Webhook] Xử lý thất bại PaymentId: {info.PaymentId}. Lỗi: {ex.Message}");
            throw; 
        }
    }

    public async Task<PaymentResponseDto> CreateSellerRegistrationPaymentAsync(SellerRegistrationPaymentRequestDto request)
    {
        // "Read-only" "data"
        var rules = await _unitOfWork.CommissionFeeRules.GetAllAsync();
        var registrationFeeRule = rules.FirstOrDefault(r => r.FeeCode == "SELLER_REG_FEE" && r.IsActive);
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);

        if (user.Role != "seller" || user.Paid == "registering" || user.Paid == "account-maintenance-fee")
            throw new InvalidOperationException("User is not a seller or has paid the fee.");
        if (registrationFeeRule == null)
            throw new Exception("Registration fee for Seller not configured yet.");

        //set fee to caculate actual value
        var feeAmount = registrationFeeRule.FeeValue;
        long orderCode = _uniqueIDGenerator.CreateUnique53BitId();

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var payment = new Payment
            {
                UserId = request.UserId,
                OrderCode = orderCode,
                TotalAmount = feeAmount,
                Method = "payos",
                PaymentType = "seller_registration",
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
            payment = await _unitOfWork.Payments.AddPaymentAsync(payment);
            await _unitOfWork.SaveChangesAsync(); //save to get PaymentId

            var paymentDetail = new PaymentDetail
            {
                PaymentId = payment.PaymentId,
                Amount = feeAmount,
                ItemId = null,
                OrderId = null
            };
            await _unitOfWork.Payments.AddPaymentDetailsAsync(new List<PaymentDetail> { paymentDetail });

            await _unitOfWork.CommitTransactionAsync();

            // payos
            var itemData = new ItemData("Seller registration fee", 1, (int)feeAmount);
            var domain = _config["AppSettings:Domain"] ?? "http://localhost:5173/";
            var paymentData = new PaymentData(
                orderCode, (int)feeAmount, $"Pay Seller registration fee for User ID: {request.UserId}",
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
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<PaymentResponseDto> CreateDepositPaymentLinkAsync(int userId, decimal amount)
    {
        long depositOrderCode = _uniqueIDGenerator.CreateUnique53BitId();

        await _unitOfWork.BeginTransactionAsync();
        Payment paymentRecord;
        try
        {
            paymentRecord = new Payment
            {
                UserId = userId,
                OrderCode = depositOrderCode,
                TotalAmount = amount,
                Method = "payos",
                Status = "pending",
                PaymentType = "deposit",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            paymentRecord = await _unitOfWork.Payments.AddPaymentAsync(paymentRecord);
            await _unitOfWork.SaveChangesAsync(); // save to get PaymentId

            var depositDetail = new PaymentDetail
            {
                PaymentId = paymentRecord.PaymentId,
                OrderId = null,
                ItemId = null,
                Amount = amount
            };
            await _unitOfWork.Payments.AddPaymentDetailsAsync(new List<PaymentDetail> { depositDetail });

            await _unitOfWork.CommitTransactionAsync();
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception("Failed to create payment record.", ex);
        }

        // payos
        try
        {
            var description = $"Deposit: {userId}";
            var payOSItem = new ItemData(name: "Wallet Deposit", quantity: 1, price: (int)amount);
            var domain = _config["AppSettings:Domain"] ?? "http://localhost:5173/";
            var paymentData = new PaymentData(
                orderCode: depositOrderCode,
                amount: (int)amount,
                description: description,
                items: new List<ItemData> { payOSItem },
                cancelUrl: $"{domain}wallet/deposit/cancel?paymentId={paymentRecord.PaymentId}",
                returnUrl: $"{domain}wallet/deposit/success?paymentId={paymentRecord.PaymentId}"
            );

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
            await _unitOfWork.Payments.UpdatePaymentStatusAsync(paymentRecord.PaymentId, "failed");
            await _unitOfWork.SaveChangesAsync();
            throw new Exception("Failed to create payment link. Please try again later.", ex);
        }
    }

    private async Task UpdateRelatedEntitiesInternalAsync(List<PaymentDetailDto> details)
    {
        foreach (var detail in details)
        {
            if (detail.OrderId.HasValue)
            {
                var order = await _unitOfWork.Orders.GetByIdAsync(detail.OrderId.Value);
                if (order != null)
                {
                    order.Status = "paid";
                    order.UpdatedAt = DateTime.UtcNow;
                }
            }
            if (detail.ItemId.HasValue)
            {
                var item = await _unitOfWork.Items.GetByIdAsync(detail.ItemId.Value);
                if (item != null)
                {
                    item.Status = "sold";
                    item.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}