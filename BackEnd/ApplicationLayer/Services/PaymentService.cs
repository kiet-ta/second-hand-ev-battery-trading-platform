using Application.DTOs;
using Application.DTOs.PaymentDtos;
using Application.IHelpers;
using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
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
    private readonly INotificationService _notificationService;

    public PaymentService(
        PayOS payOS,
        IConfiguration config,
        IUniqueIDGenerator uniqueIDGenerator,
        IUnitOfWork unitOfWork,
        INotificationService notificationService
        )
    {
        _payOS = payOS;
        _config = config;
        _uniqueIDGenerator = uniqueIDGenerator;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    private async Task UpdateItemInventoryForOrderAsync(int orderId)
    {
        var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId);

        if (order == null)
        {
            throw new NullReferenceException($"Không tìm thấy đơn hàng với ID: {orderId}");
        }
        foreach (var orderItem in order.OrderItems)
        {
            if (orderItem.Status == OrderItemStatus.Completed.ToString())
            {
                var item = await _unitOfWork.Items.GetByIdAsync(orderItem.ItemId);

                if (item != null)
                {
                    if (item.Quantity >= orderItem.Quantity)
                    {
                        item.Quantity -= orderItem.Quantity;

                        if (item.Quantity == 0)
                        {
                            item.Status = ItemStatus.Sold.ToString();
                        }
                        _unitOfWork.Items.Update(item);
                    }
                    else
                    {
                        throw new InvalidOperationException($"Lỗi tồn kho: Item ID {item.ItemId} không đủ số lượng.");
                    }
                }
            }
            else if(orderItem.Status == OrderItemStatus.Pending.ToString())
            {
                orderItem.Status = OrderItemStatus.Completed.ToString();
                orderItem.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.OrderItems.UpdateAsync(orderItem);
            }
            else
            {
                throw new InvalidOperationException($"Đơn hàng {orderId} đang ở trạng thái không thể thanh toán: {orderItem.Status}");
            }
        }
    }

    // Once the order is completed, the money will be divided between the MANAGER and the SELLER.
    public async Task<bool> ConfirmOrderAndSplitPaymentAsync(int orderItemId, int buyerId)
    {
        try
        {
            var orderItem = await _unitOfWork.OrderItems.GetByIdAsync(orderItemId);

            if (orderItem == null)
                throw new Exception("Không tìm thấy sản phẩm trong đơn hàng.");
            var order = await _unitOfWork.Orders.GetByIdAsync(orderItem.OrderId.Value);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng.");
            if (order.BuyerId != buyerId)
                throw new Exception("Bạn không phải chủ đơn hàng này.");

            var item = await _unitOfWork.Items.GetByIdAsync(orderItem.ItemId);
            if (item == null)
                throw new Exception("Không tìm thấy sản phẩm.");

            int? sellerId = item.UpdatedBy;
            decimal totalOrderAmount = orderItem.Price * orderItem.Quantity;

            await _unitOfWork.BeginTransactionAsync();

            var seller = await _unitOfWork.Users.GetByIdAsync(sellerId.Value);
            var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
            var managerWallet = await _unitOfWork.Wallets.GetManagerWalletAsync();

            if (sellerWallet == null)
                throw new Exception($"Không tìm thấy ví cho Seller (ID: {sellerId}).");
            string feeCode;
            if (seller.IsStore) feeCode = "FEESF";
            else feeCode = "FEEPF";
                var commissionRule = await _unitOfWork.CommissionFeeRules.GetByFeeCodeAsync(feeCode); 
            if (commissionRule == null)
                throw new Exception("Không tìm thấy quy tắc hoa hồng 'FEE001'.");

            decimal commissionAmount = 0;
            if (commissionRule.FeeType == CommissionFeeType.Percentage.ToString())
            {
                commissionAmount = totalOrderAmount * (commissionRule.FeeValue / 100);
            }
            else
            {
                commissionAmount = commissionRule.FeeValue;
            }

            decimal netAmountForSeller = totalOrderAmount - commissionAmount;

            sellerWallet.Balance += netAmountForSeller;
            sellerWallet.UpdatedAt = DateTime.Now;
            _unitOfWork.Wallets.Update(sellerWallet);

            managerWallet.Balance += commissionAmount;
            managerWallet.UpdatedAt = DateTime.Now;
            _unitOfWork.Wallets.Update(managerWallet);

            orderItem.Status = OrderItemStatus.Completed.ToString();
            orderItem.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.OrderItems.UpdateAsync(orderItem);

            var sellerTransaction = new WalletTransaction
            {
                WalletId = sellerWallet.WalletId,
                Amount = netAmountForSeller,
                Type = WalletTransactionType.Revenue.ToString(),
                OrderId = orderItem.OrderId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.WalletTransactions.AddAsync(sellerTransaction);

            var managerTransaction = new WalletTransaction
            {
                WalletId = managerWallet.WalletId,
                Amount = commissionAmount,
                Type = WalletTransactionType.Revenue.ToString(),
                OrderId = orderItem.OrderId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.WalletTransactions.AddAsync(managerTransaction);

            await _unitOfWork.SaveChangesAsync();

            var commissionLog = new TransactionCommission
            {
                WalletTransactionId = managerTransaction.TransactionId,
                RuleId = commissionRule.RuleId,
                AppliedValue = commissionAmount,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.TransactionCommission.AddAsync(commissionLog);

            var notificationToSeller = new CreateNotificationDto
            {
                NotiType = NotificationType.Activities.ToString(),
                Title = $"Đơn hàng CMS_EV_{orderItem.OrderId} đã hoàn tất.",
                Message = $"Sản phẩm '{item.Title}' trong đơn hàng CMS_EV_{orderItem.OrderId} đã được xác nhận hoàn tất bởi người mua. Số tiền {netAmountForSeller} đã được chuyển vào ví của bạn sau khi trừ phí hoa hồng.",
                TargetUserId = sellerId.ToString(),
            };
            await _notificationService.AddNewNotification(notificationToSeller, 0 , "");
            await _unitOfWork.SaveChangesAsync();
            await _notificationService.SendNotificationAsync(notificationToSeller.Title, notificationToSeller.TargetUserId);
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
                Status = PaymentStatus.Pending.ToString(),
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
                wallet.UpdatedAt = DateTime.Now;
                await _unitOfWork.Wallets.UpdateBalanceAsync(wallet.WalletId, -request.TotalAmount);

                var walletTransaction = new WalletTransaction
                {
                    WalletId = wallet.WalletId,
                    Amount = -request.TotalAmount,
                    Type = WalletTransactionType.Payment.ToString(),
                    RefId = payment.PaymentId,
                    CreatedAt = DateTime.Now
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(walletTransaction);

                await _unitOfWork.Payments.UpdatePaymentStatusAsync(payment.PaymentId, "completed");
                //TuCore
                var orderIdsToUpdate = request.Details
                        .Where(d => d.OrderId.HasValue)
                        .Select(d => d.OrderId.Value)
                        .Distinct()
                        .ToList();

                foreach (var orderId in orderIdsToUpdate)
                {
                    await UpdateItemInventoryForOrderAsync(orderId);
                }

                //await UpdateRelatedEntitiesInternalAsync(request.Details);

                await _unitOfWork.CommitTransactionAsync();

                return new PaymentResponseDto
                {
                    PaymentId = payment.PaymentId,
                    OrderCode = orderCode,
                    Status = PaymentStatus.Completed.ToString()
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
                    Status = PaymentStatus.Pending.ToString()
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

        await _unitOfWork.Payments.UpdatePaymentStatusAsync(info.PaymentId, PaymentStatus.Failed.ToString());
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task HandleWebhookAsync(WebhookType body)
    {
        var data = _payOS.verifyPaymentWebhookData(body);
        if (data.code != "00" || data.desc != "success")
            return;

        var info = await _unitOfWork.Payments.GetPaymentInfoByOrderCodeAsync(data.orderCode);
        if (info == null || info.Status == PaymentStatus.Completed.ToString())
        {
            Console.WriteLine($"[Webhook] Bỏ qua, đơn hàng đã xử lý: {data.orderCode}");
            return;
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            await _unitOfWork.Payments.UpdatePaymentStatusAsync(info.PaymentId, PaymentStatus.Completed.ToString());

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
                        user.Paid = UserPaid.Registering.ToString();
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
                        Type = WalletTransactionType.Deposit.ToString(),
                        RefId = info.PaymentId, 
                        CreatedAt = DateTime.Now
                    };
                    await _unitOfWork.WalletTransactions.CreateTransactionAsync(transaction);
                }
            }
            else if (info.Details.Any(d => d.Amount > 0))
            {
                Console.WriteLine($"[Webhook] Xử lý Mua hàng (Escrow) cho PaymentId: {info.PaymentId}");

                //await UpdateRelatedEntitiesInternalAsync(info.Details);
                //TuCore
                var orderIdsToUpdate = info.Details
                        .Where(d => d.OrderId.HasValue)
                        .Select(d => d.OrderId.Value)
                        .Distinct()
                        .ToList();

                foreach (var orderId in orderIdsToUpdate)
                {
                    await UpdateItemInventoryForOrderAsync(orderId);
                }

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
                    Type = WalletTransactionType.Hold.ToString(),
                    RefId = info.PaymentId,
                    CreatedAt = DateTime.Now
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

        if (user.Role != UserRole.Seller.ToString()|| user.Paid == UserPaid.Registering.ToString() || user.Paid == "account-maintenance-fee")
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
                PaymentType = "seller_registration", // ?????
                Status = PaymentStatus.Pending.ToString(),
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
                Status = PaymentStatus.Pending.ToString()
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
                Status = PaymentStatus.Pending.ToString(),
                PaymentType = PaymentType.Deposit.ToString(),
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
                cancelUrl: $"{domain}wallet",
                returnUrl: $"{domain}wallet"
            );

            CreatePaymentResult payOSResult = await _payOS.createPaymentLink(paymentData);
            return new PaymentResponseDto
            {
                PaymentId = paymentRecord.PaymentId,
                OrderCode = payOSResult.orderCode,
                CheckoutUrl = payOSResult.checkoutUrl,
                Status = PaymentStatus.Pending.ToString()
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
                    order.UpdatedAt = DateTime.UtcNow;
                }
            }
            if (detail.ItemId.HasValue)
            {
                var item = await _unitOfWork.Items.GetByIdAsync(detail.ItemId.Value);
                if (item != null)
                {
                    item.Status = ItemStatus.Sold.ToString();
                    item.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }

    public async Task ProcessSuccessfulPaymentAsync(int orderId, string transactionId, decimal amount)
    {
        var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId);
        
        if (order == null)
        {
            throw new NullReferenceException($"Không tìm thấy đơn hàng với ID: {orderId}");
        }
    

            foreach (var orderItem in order.OrderItems)
            {
                if (orderItem.Status == OrderItemStatus.Pending.ToString())
                {
                    orderItem.Status = OrderItemStatus.Completed.ToString();
                    orderItem.UpdatedAt = DateTime.UtcNow;
                    await _unitOfWork.OrderItems.UpdateAsync(orderItem);
                }
                else
                {
                    throw new InvalidOperationException($"Đơn hàng {orderId} đang ở trạng thái không thể thanh toán: {orderItem.Status}");
                }
            

            var item = await _unitOfWork.Items.GetByIdAsync(orderItem.ItemId);

                if (item != null)
                {
                    if (item.Quantity >= orderItem.Quantity)
                    {
                        item.Quantity -= orderItem.Quantity;

                        if (item.Quantity == 0)
                        {
                            item.Status = ItemStatus.Sold.ToString();
                        }
                        _unitOfWork.Items.Update(item);
                    }
                    else
                    {
                        throw new InvalidOperationException($"Lỗi tồn kho: Item ID {item.ItemId} không đủ số lượng.");
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Send email confirm/notification to user
            // await _mailService.SendPurchaseSuccessMail(order);
    }
}