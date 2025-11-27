using Application.DTOs;
using Application.DTOs.WalletDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class WalletService : IWalletService
{
    private readonly IUnitOfWork _unitOfWork;

    public WalletService( IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WalletDto> GetWalletByUserIdAsync(int userId)
    {
        var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(userId);
        if (wallet == null)
        {
            return null;
        }

        return new WalletDto
        {
            WalletId = wallet.WalletId,
            Balance = wallet.Balance,
            Currency = wallet.Currency,
            Status = wallet.Status
        };
    }

    public async Task<IEnumerable<WalletTransactionDto>> GetTransactionsByWalletIdAsync(int walletId)
    {
        var transactions = await _unitOfWork.WalletTransactions.GetTransactionsByWalletIdAsync(walletId);

        return transactions.Select(t => new WalletTransactionDto
        {
            TransactionId = t.TransactionId,
            Amount = t.Amount,
            Type = t.Type,
            ReferenceId = t.RefId,
            CreatedAt = t.CreatedAt
        }).ToList();
    }

    public async Task<bool> DepositAsync(int userId, decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Deposit amount must be greater than 0");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(userId);
        if (wallet == null)
        {
            throw new KeyNotFoundException("User wallet not found");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {

            //Update wallet balance
            var success = await _unitOfWork.Wallets.UpdateBalanceAsync(wallet.WalletId, amount);
        if (!success) return false;

        //record Payment
        var paymentOrderCode = long.Parse(DateTime.Now.ToString("yyyyMMddHHmmss") + userId.ToString());

        var payment = new Payment
        {
            UserId = userId,
            OrderCode = paymentOrderCode,
            TotalAmount = amount,
            Method = "Wallet",
            Status = "Completed",
            PaymentType = PaymentType.Deposit.ToString(),
            CreatedAt = DateTime.Now
        };

        var newPayment = await _unitOfWork.Payments.CreatePaymentAsync(payment);
        if (newPayment == null) return false;

        //record PaymentDetail
        var paymentDetail = new PaymentDetail
        {
            UserId = newPayment.UserId,
            UserRole = user.Role,
            PaymentId = newPayment.PaymentId,
            Amount = amount,
            // Đối với giao dịch nạp tiền, OrderId và ItemId thường là NULL
            OrderId = null,
            ItemId = null,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.PaymentDetails.CreatePaymentDetailAsync(paymentDetail);

        //record WalletTransaction
        var wallettransaction = new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = amount,
            Type = WalletTransactionType.Deposit.ToString(),
            CreatedAt = DateTime.Now,
            PaymentId = newPayment.PaymentId
        };
        await _unitOfWork.WalletTransactions.CreateTransactionAsync(wallettransaction);
            //await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();
            return true;
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }

    }

    public async Task<WalletTransactionDto> WithdrawAsync(WithdrawRequestDto request)
    {
        if (request.Amount <= 0)
        {
            throw new ArgumentException("Withdrawal amount must be greater than 0.");
        }

        if (request.Type != WalletTransactionType.Withdraw.ToString() && request.Type != WalletTransactionType.Payment.ToString())
        {
            throw new ArgumentException("Invalid transaction type. Must be 'Withdraw' or 'Payment'.");
        }

        var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(request.UserId);
        if (wallet == null)
        {
            throw new KeyNotFoundException("User wallet not found.");
        }

        if (wallet.Balance < request.Amount)
        {
            throw new InvalidOperationException("Insufficient wallet balance.");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var success = await _unitOfWork.Wallets.UpdateBalanceAsync(wallet.WalletId, -request.Amount);
            if (!success)
            {
                throw new Exception("Failed to update wallet balance.");
            }
            var paymentOrderCode = long.Parse(DateTime.Now.ToString("yyyyMMddHHmmss") + request.UserId.ToString());

            var payment = new Payment
            {
                UserId = request.UserId,
                OrderCode = paymentOrderCode,
                TotalAmount = -request.Amount,
                Method = "Wallet",
                Status = "Completed",
                PaymentType = PaymentType.Order_Purchase.ToString(),
                CreatedAt = DateTime.Now
            };

            var newPayment = await _unitOfWork.Payments.CreatePaymentAsync(payment);

            if (newPayment == null) throw new Exception("Failed to create payment record.");

            var paymentDetail = new PaymentDetail
            {
                UserId = request.UserId,
                UserRole = request.UserRole,
                PaymentId = newPayment.PaymentId,
                Amount = -request.Amount,
                OrderId = request.Type == WalletTransactionType.Withdraw.ToString() ? request.OrderId : null,
                ItemId = request.ItemId,
                CreatedAt = DateTime.Now
            };

            await _unitOfWork.PaymentDetails.CreatePaymentDetailAsync(paymentDetail);

            var walletTransaction = new WalletTransaction
            {
                WalletId = wallet.WalletId,
                Amount = -request.Amount,
                Type = request.Type,
                OrderId = request.OrderId,
                PaymentId = newPayment.PaymentId,
                CreatedAt = DateTime.Now
            };

            var transactionId = await _unitOfWork.WalletTransactions.CreateTransactionAsync(walletTransaction);
            walletTransaction.TransactionId = transactionId;

            //await _context.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return new WalletTransactionDto
            {
                TransactionId = walletTransaction.TransactionId,
                Amount = -walletTransaction.Amount,
                Type = walletTransaction.Type,
                OrderId = walletTransaction.OrderId,
                ItemId = request.ItemId,
                PaymentId = walletTransaction.PaymentId,
                CreatedAt = walletTransaction.CreatedAt
            };
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<bool> TransferServiceFeeToManagerAsync(int sellerId)
    {

        var seller = await _unitOfWork.Users.GetByIdAsync(sellerId);
        if (seller == null)
            throw new KeyNotFoundException($"Không tìm thấy người bán (Seller ID: {sellerId}).");

        if (seller.Role != UserRole.Seller.ToString())
            throw new KeyNotFoundException($"Bạn không phải là Seller (Role của bạn là: {seller.Role}).");

        var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
        if (sellerWallet == null)
            throw new Exception($"Không tìm thấy ví cho Seller (ID: {sellerId}).");

        var managerWallet = await _unitOfWork.Wallets.GetManagerWalletAsync();
        if (managerWallet == null)
            throw new Exception("Không tìm thấy ví Quản lý.");


        string feeCode;
        if (seller.IsStore) feeCode = "FEESR";
        else feeCode = "FEEPR";

        var commissionRule = await _unitOfWork.CommissionFeeRules.GetByFeeCodeAsync(feeCode);
        if (commissionRule == null || !commissionRule.IsActive)
            throw new Exception($"Không tìm thấy hoặc quy tắc phí '{feeCode}' không hoạt động.");

        decimal amountToTransfer = 0;
        if (commissionRule.FeeType == CommissionFeeType.Fixed.ToString())
        {
            amountToTransfer = commissionRule.FeeValue;
        }
        else
        {
            throw new InvalidOperationException($"Rule type '{commissionRule.FeeType}' not supported for fixed service fee.");
        }

        if (amountToTransfer <= 0)
            throw new ArgumentException("Số tiền phí đã tính phải lớn hơn 0.");

        if (sellerWallet.Balance < amountToTransfer)
        {
            throw new InvalidOperationException("Số dư ví không đủ để trừ phí.");
        }

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var sellerPaymentType = PaymentType.Seller_Registration.ToString();
            var transactionType = WalletTransactionType.Withdraw.ToString();
            var revenueType = WalletTransactionType.Revenue.ToString();
            var managerPaymentType = PaymentType.Kyc_Revenue.ToString();

            var successDebit = await _unitOfWork.Wallets.UpdateBalanceAsync(sellerWallet.WalletId, -amountToTransfer);
            if (!successDebit)
            {
                throw new Exception("Failed to update Seller wallet balance.");
            }

            var successCredit = await _unitOfWork.Wallets.UpdateBalanceAsync(managerWallet.WalletId, amountToTransfer);
            if (!successCredit)
            {
                throw new Exception("Failed to update Manager wallet balance.");
            }

            var paymentOrderCode = long.Parse(DateTime.Now.ToString("yyyyMMddHHmmss") + sellerId.ToString());

            var payment = new Payment
            {
                UserId = sellerId,
                OrderCode = paymentOrderCode,
                TotalAmount = -amountToTransfer,
                Method = "Wallet",
                Status = "Completed",
                PaymentType = sellerPaymentType,
                CreatedAt = DateTime.Now
            };
            var newPayment = await _unitOfWork.Payments.CreatePaymentAsync(payment);
            if (newPayment == null) throw new Exception("Failed to create payment record.");

            var sellerPaymentDetail = new PaymentDetail
            {
                UserId = sellerId,
                UserRole = UserRole.Seller.ToString(),
                PaymentId = newPayment.PaymentId,
                Amount = -amountToTransfer,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.PaymentDetails.CreatePaymentDetailAsync(sellerPaymentDetail);

            var managerPaymentDetail = new PaymentDetail
            {
                UserId = managerWallet.UserId,
                UserRole = UserRole.Manager.ToString(),
                PaymentId = newPayment.PaymentId,
                Amount = amountToTransfer,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.PaymentDetails.CreatePaymentDetailAsync(managerPaymentDetail);

            var sellerTransaction = new WalletTransaction
            {
                WalletId = sellerWallet.WalletId,
                Amount = -amountToTransfer,
                Type = transactionType,
                PaymentId = newPayment.PaymentId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.WalletTransactions.AddAsync(sellerTransaction);

            var managerTransaction = new WalletTransaction
            {
                WalletId = managerWallet.WalletId,
                Amount = amountToTransfer,
                Type = revenueType,
                PaymentId = newPayment.PaymentId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.WalletTransactions.AddAsync(managerTransaction);

            var commissionLog = new TransactionCommission
            {
                WalletTransactionId = managerTransaction.WalletId,
                PaymentTransactionId = managerPaymentDetail.PaymentId,
                RuleId = commissionRule.RuleId,
                AppliedValue = amountToTransfer,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.TransactionCommission.AddAsync(commissionLog);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return true;
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<bool> ProductModerationFeeAsync(int sellerId)
    {

        var seller = await _unitOfWork.Users.GetByIdAsync(sellerId);
        if (seller == null)
            throw new KeyNotFoundException($"Không tìm thấy người bán (Seller ID: {sellerId}).");

        if (seller.Role != UserRole.Seller.ToString())
            throw new KeyNotFoundException($"Bạn không phải là Seller (Role của bạn là: {seller.Role}).");

        var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
        if (sellerWallet == null)
            throw new Exception($"Không tìm thấy ví cho Seller (ID: {sellerId}).");

        var managerWallet = await _unitOfWork.Wallets.GetManagerWalletAsync();
        if (managerWallet == null)
            throw new Exception("Không tìm thấy ví Quản lý.");


        string feeCode;
        if (seller.IsStore) feeCode = "FEESM";
        else feeCode = "FEEPM";

        var commissionRule = await _unitOfWork.CommissionFeeRules.GetByFeeCodeAsync(feeCode);
        if (commissionRule == null || !commissionRule.IsActive)
            throw new Exception($"Không tìm thấy hoặc quy tắc phí '{feeCode}' không hoạt động.");

        decimal amountToTransfer = 0;
        if (commissionRule.FeeType == CommissionFeeType.Fixed.ToString())
        {
            amountToTransfer = commissionRule.FeeValue;
        }
        else
        {
            throw new InvalidOperationException($"Rule type '{commissionRule.FeeType}' not supported for fixed service fee.");
        }

        if (amountToTransfer <= 0)
            throw new ArgumentException("Số tiền phí đã tính phải lớn hơn 0.");

        if (sellerWallet.Balance < amountToTransfer)
        {
            throw new InvalidOperationException("Số dư ví không đủ để trừ phí.");
        }

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var sellerPaymentType = PaymentType.Product_Moderation.ToString();
            var transactionType = WalletTransactionType.Withdraw.ToString();
            var revenueType = WalletTransactionType.Revenue.ToString();
            var managerPaymentType = PaymentType.Kyc_Revenue.ToString();

            var successDebit = await _unitOfWork.Wallets.UpdateBalanceAsync(sellerWallet.WalletId, -amountToTransfer);
            if (!successDebit)
            {
                throw new Exception("Failed to update Seller wallet balance.");
            }

            var successCredit = await _unitOfWork.Wallets.UpdateBalanceAsync(managerWallet.WalletId, amountToTransfer);
            if (!successCredit)
            {
                throw new Exception("Failed to update Manager wallet balance.");
            }

            var paymentOrderCode = long.Parse(DateTime.Now.ToString("yyyyMMddHHmmss") + sellerId.ToString());

            var payment = new Payment
            {
                UserId = sellerId,
                OrderCode = paymentOrderCode,
                TotalAmount = -amountToTransfer,
                Method = "Wallet",
                Status = "Completed",
                PaymentType = sellerPaymentType,
                CreatedAt = DateTime.Now
            };
            var newPayment = await _unitOfWork.Payments.CreatePaymentAsync(payment);
            if (newPayment == null) throw new Exception("Failed to create payment record.");

            var sellerPaymentDetail = new PaymentDetail
            {
                UserId = sellerId,
                UserRole = UserRole.Seller.ToString(),
                PaymentId = newPayment.PaymentId,
                Amount = -amountToTransfer,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.PaymentDetails.CreatePaymentDetailAsync(sellerPaymentDetail);

            var managerPaymentDetail = new PaymentDetail
            {
                UserId = managerWallet.UserId,
                UserRole = UserRole.Manager.ToString(),
                PaymentId = newPayment.PaymentId,
                Amount = amountToTransfer,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.PaymentDetails.CreatePaymentDetailAsync(managerPaymentDetail);

            var sellerTransaction = new WalletTransaction
            {
                WalletId = sellerWallet.WalletId,
                Amount = -amountToTransfer,
                Type = transactionType,
                PaymentId = newPayment.PaymentId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.WalletTransactions.AddAsync(sellerTransaction);

            var managerTransaction = new WalletTransaction
            {
                WalletId = managerWallet.WalletId,
                Amount = amountToTransfer,
                Type = revenueType,
                PaymentId = newPayment.PaymentId,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.WalletTransactions.AddAsync(managerTransaction);

            var commissionLog = new TransactionCommission
            {
                WalletTransactionId = managerTransaction.WalletId,
                PaymentTransactionId = managerPaymentDetail.PaymentId,
                RuleId = commissionRule.RuleId,
                AppliedValue = amountToTransfer,
                CreatedAt = DateTime.Now
            };
            await _unitOfWork.TransactionCommission.AddAsync(commissionLog);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return true;
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<WalletTransactionDto> RevenueAsync(WithdrawRequestDto request)
    {
        var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(request.UserId);
        if (wallet == null)
        {
            throw new KeyNotFoundException("User wallet not found.");
        }

        if (wallet.Balance < request.Amount)
        {
            throw new InvalidOperationException("Insufficient wallet balance.");
        }

        var transaction = new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = request.Amount, 
            Type = request.Type,
            RefId = request.RefId,
            CreatedAt = DateTime.Now
        };

        var transactionId = await _unitOfWork.WalletTransactions.CreateTransactionAsync(transaction);
        transaction.TransactionId = transactionId;

        return new WalletTransactionDto
        {
            TransactionId = transaction.TransactionId,
            Amount = transaction.Amount,
            Type = transaction.Type,
            ReferenceId = transaction.RefId,
            CreatedAt = transaction.CreatedAt
        };
    }
}