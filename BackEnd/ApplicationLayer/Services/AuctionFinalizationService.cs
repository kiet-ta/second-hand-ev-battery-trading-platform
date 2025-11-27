using Application.DTOs;
using Application.IHelpers;
using Application.IRepositories;
using Application.IServices;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class AuctionFinalizationService : IAuctionFinalizationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuctionFinalizationService> _logger;
    private readonly INotificationService _notificationService;
    private readonly IUniqueIDGenerator _uniqueIDGenerator;

    private const string AuctionNotificationType = "Activities";

    public AuctionFinalizationService(IUnitOfWork unitOfWork, ILogger<AuctionFinalizationService> logger, INotificationService notificationService, IUniqueIDGenerator uniqueIDGenerator)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _notificationService = notificationService;
        _uniqueIDGenerator = uniqueIDGenerator;
    }

    public async Task FinalizeAuctionAsync(int auctionId)
    {
        _logger.LogInformation("Finalizing auction with ID: {AuctionId}", auctionId);
        await _unitOfWork.BeginTransactionAsync();

        try
        {
            // 1. Retrieve and Validate Auction
            var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
            if (auction == null)
            {
                _logger.LogWarning("Auction {AuctionId} not found during finalization.", auctionId);
                await _unitOfWork.RollbackTransactionAsync();
                return;
            }

            // 2. Check if transaction already exists (Idempotency check)
            var existingPaymentTx = await _unitOfWork.WalletTransactions
                .GetTransactionByAuctionIdAndTypeAsync(auctionId, WalletTransactionType.Payment.ToString());

            if (existingPaymentTx != null)
            {
                _logger.LogInformation($"Auction {auctionId} already finalized (Order created). Skipping.");
                await _unitOfWork.RollbackTransactionAsync();
                return;
            }

            // 3. Update Auction Status to 'Ended' if necessary
            // Allow finalizing 'Ongoing' (expired) or 'Ended' (pending processing) auctions
            if (auction.Status != AuctionStatus.Ongoing.ToString() && auction.Status != AuctionStatus.Ended.ToString())
            {
                await _unitOfWork.RollbackTransactionAsync();
                return;
            }

            if (auction.Status != AuctionStatus.Ended.ToString())
            {
                auction.Status = AuctionStatus.Ended.ToString();
                auction.UpdatedAt = DateTime.Now;
                await _unitOfWork.Auctions.Update(auction);
            }

            // 4. Determine Winner
            var winningBid = await _unitOfWork.Bids.GetHighestActiveBidAsync(auctionId);

            // CASE: No Bidders
            if (winningBid == null)
            {
                _logger.LogInformation($"Auction {auctionId} ended with no winning bids.");

                // Optional: Revert item status to Active if needed
                var itemNoBids = await _unitOfWork.Items.GetByIdAsync(auction.ItemId);
                if (itemNoBids != null && itemNoBids.Status == ItemStatus.Auction_Active.ToString())
                {
                    itemNoBids.Status = ItemStatus.Active.ToString();
                    _unitOfWork.Items.Update(itemNoBids);
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation($"Updated Item {auction.ItemId} status back to active.");
                }
                await _unitOfWork.CommitTransactionAsync();
                return;
            }

            // CASE: Has Winner
            await _unitOfWork.Bids.UpdateBidStatusAsync(winningBid.BidId, BidStatus.Winner.ToString());
            _logger.LogInformation($"Auction {auctionId} winner: User {winningBid.UserId} with Bid {winningBid.BidId} amount {winningBid.BidAmount}");

            var winnerId = winningBid.UserId;
            var winningAmount = winningBid.BidAmount; // This is the Item Price
            var itemId = auction.ItemId;

            // 5. Get Seller Info
            var itemWithSeller = await _unitOfWork.Items.GetItemAndSellerByItemIdAsync(itemId);
            if (itemWithSeller?.Seller == null || itemWithSeller.Item == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Could not find owner for item {itemId}.");
            }
            int sellerId = itemWithSeller.Seller.UserId;

            // 6. Get Wallets
            var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
            if (sellerWallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Seller wallet for user ID {sellerId} not found.");
            }

            var winnerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(winnerId);
            if (winnerWallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Winner wallet {winnerId} not found.");
            }

            // 7. Calculate Shipping Fee (Safe Execution)
            // Wrapp in try-catch to prevent transaction rollback if GHN API fails
            decimal shippingCost = 0;
            try
            {
                var shippingFee = await _unitOfWork.Address.CalulateShippingFee(winnerId);
                if (shippingFee != null && shippingFee.Data != null)
                {
                    shippingCost = shippingFee.Data.Total;
                }
            }
            catch (Exception ex)
            {
                // Log error but continue with 0 shipping cost to finalize the order
                _logger.LogError(ex, "Failed to calculate shipping fee for winner {WinnerId}. Defaulting to 0.", winnerId);
                shippingCost = 0;
            }

            // Calculate Total Amount to deduct
            decimal totalPaymentAmount = winningAmount + shippingCost;

            // 8. Process Winner Wallet (2-Step Logic)

            // Step A: Release the "Held" balance associated with the bid.
            // This moves the money from 'Held' back to 'Available' logic inside the wallet.
            // We do this so we can then subtract the full Total Amount (Price + Ship) in Step B.
            bool releaseHoldSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(winnerWallet.WalletId, 0, -winningAmount);
            if (!releaseHoldSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Failed to release held balance for winner wallet {winnerWallet.WalletId}.");
            }

            // Step B: Deduct the Total Amount from Balance.
            // Check if user has enough balance for Item + Shipping.
            bool paymentSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(winnerWallet.WalletId, -totalPaymentAmount, 0);
            if (!paymentSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Winner {winnerId} does not have enough balance to pay for Item + Shipping ({totalPaymentAmount:N0}).");
            }

            // 9. Create Order
            var winnerAddress = await _unitOfWork.Address.GetAddressDefaultByUserId(winnerId);
            if (winnerAddress == null)
            {
                // Fallback to any address
                var anyAddress = (await _unitOfWork.Address.GetAddressesByUserIdAsync(winnerId)).FirstOrDefault();
                if (anyAddress == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw new InvalidOperationException($"Winner {winnerId} has no addresses.");
                }
                winnerAddress = anyAddress;
            }

            var newOrder = new Order
            {
                ShippingPrice = shippingCost,
                BuyerId = winnerId,
                AddressId = winnerAddress.AddressId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            await _unitOfWork.Orders.AddAsync(newOrder);
            await _unitOfWork.SaveChangesAsync(); // Save to generate OrderId
            _logger.LogInformation("Created Order {OrderId} for winner User {WinnerId}", newOrder.OrderId, winnerId);

            // 10. Record "Payment" Transaction
            var walletTransaction = new WalletTransaction
            {
                WalletId = winnerWallet.WalletId,
                Amount = -totalPaymentAmount,
                Type = WalletTransactionType.Payment.ToString(),
                CreatedAt = DateTime.Now,
                RefId = newOrder.OrderId,
                AuctionId = auctionId,
                OrderId = newOrder.OrderId
            };
            await _unitOfWork.WalletTransactions.CreateTransactionAsync(walletTransaction);

            // 11. Create Payment Record
            long orderCode = _uniqueIDGenerator.CreateUnique53BitId();
            var newPayment = new Payment
            {
                UserId = winnerId,
                OrderCode = orderCode,
                TotalAmount = totalPaymentAmount, // Save total amount (Bid + Ship)
                Currency = "VND",
                Method = "Wallet",
                Status = PaymentStatus.Completed.ToString(),
                PaymentType = PaymentType.Order_Purchase.ToString(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                ExpiredAt = null
            };

            await _unitOfWork.Payments.AddPaymentAsync(newPayment);
            await _unitOfWork.SaveChangesAsync();

            var newPaymentDetail = new PaymentDetail
            {
                UserId = newPayment.UserId,
                PaymentId = newPayment.PaymentId,
                OrderId = newOrder.OrderId,
                ItemId = itemId,
                Amount = totalPaymentAmount
            };

            await _unitOfWork.PaymentDetails.AddPaymentDetailAsync(newPaymentDetail);
            await _unitOfWork.SaveChangesAsync();

            // 12. Create Order Item
            var newOrderItem = new OrderItem
            {
                OrderId = newOrder.OrderId,
                BuyerId = winnerId,
                ItemId = itemId,
                Quantity = 1,
                Price = winningAmount, // Save item price
                Status = OrderItemStatus.Pending.ToString(),
                IsDeleted = false
            };

            await _unitOfWork.Items.UpdateItemQuantityAsync(itemId, itemWithSeller.Item.Quantity);
            await _unitOfWork.OrderItems.CreateAsync(newOrderItem);
            await _unitOfWork.SaveChangesAsync();

            // 13. Process Refunds for Losers
            var loserBids = await _unitOfWork.Bids.GetAllLoserActiveOrOutbidBidsAsync(auctionId, winnerId);

            foreach (var loserBid in loserBids)
            {
                // Find corresponding 'hold' transaction
                var holdTransaction = await _unitOfWork.WalletTransactions.FindHoldTransactionByRefIdAsync(loserBid.BidId);
                if (holdTransaction == null)
                {
                    _logger.LogWarning("Could not find 'hold' transaction for loser Bid {BidId}. Skipping refund.", loserBid.BidId);
                    await _unitOfWork.Bids.UpdateBidStatusAsync(loserBid.BidId, BidStatus.Released.ToString());
                    continue;
                }

                decimal amountToRelease = -holdTransaction.Amount; // Convert to positive

                // Refund Logic: ONLY decrease HeldBalance. Do NOT touch Balance.
                // (Assuming PlaceBid only increased HeldBalance and didn't touch Balance)
                bool updateLoserWallet = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(holdTransaction.WalletId, 0, -amountToRelease);

                if (!updateLoserWallet)
                {
                    _logger.LogError("CRITICAL: Failed to release funds for loser Bid {BidId}. Wallet {WalletId}.", loserBid.BidId, holdTransaction.WalletId);
                    continue; // Continue to next user, don't crash
                }

                // Create 'Released' Transaction
                var releaseTransaction = new WalletTransaction
                {
                    WalletId = holdTransaction.WalletId,
                    Amount = amountToRelease,
                    Type = WalletTransactionType.Released.ToString(),
                    CreatedAt = DateTime.Now,
                    RefId = loserBid.BidId,
                    AuctionId = auctionId
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(releaseTransaction);

                // Update Status
                await _unitOfWork.Bids.UpdateBidStatusAsync(loserBid.BidId, BidStatus.Released.ToString());

                // Notify Loser
                await SendNotificationAsync(
                        senderId: null, receiverId: loserBid.UserId,
                        title: $"Đấu giá #{auctionId} kết thúc",
                        message: $"Số tiền {amountToRelease:N0}đ đã được hoàn lại (giải phóng) vào ví của bạn.");
            }

            // 14. Commit Transaction
            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully finalized Auction {AuctionId}", auctionId);

            // 15. Send Final Notifications
            // Winner Notification
            var winnerNoti = new CreateNotificationDto
            {
                NotiType = NotificationType.Auction.ToString(),
                TargetUserId = winnerId.ToString(),
                Title = "Chúc mừng! Bạn đã thắng đấu giá",
                Message = $"Đơn hàng cho sản phẩm đã được tạo. Tổng thanh toán: {totalPaymentAmount:N0}đ (Đã bao gồm phí vận chuyển)."
            };
            _ = _notificationService.AddNewNotification(winnerNoti, 0, "");
            await _notificationService.SendNotificationAsync(message: winnerNoti.Message, targetUserId: winnerNoti.TargetUserId);

            // Seller Notification
            var sellerNotiDto = new CreateNotificationDto
            {
                NotiType = NotificationType.Auction.ToString(),
                TargetUserId = sellerId.ToString(),
                Title = "Phiên đấu giá đã kết thúc",
                Message = $"Sản phẩm của bạn đã được bán cho user {winnerId} với giá {winningAmount:N0}đ."
            };
            _ = _notificationService.AddNewNotification(sellerNotiDto, 0, "");
            await _notificationService.SendNotificationAsync(message: sellerNotiDto.Message, targetUserId: sellerNotiDto.TargetUserId);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finalizing Auction {AuctionId}. Rolling back transaction.", auctionId);
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    private async Task SendNotificationAsync(int? senderId, int receiverId, string title, string message)
    {
        try
        {
            var notificationDto = new CreateNotificationDto
            {
                NotiType = AuctionNotificationType,
                //SenderId = senderId,
                TargetUserId = receiverId.ToString(),
                Title = title,
                Message = message
            };
            await _notificationService.AddNewNotification(notificationDto, 1,"Manager");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to User {ReceiverId} regarding Auction finalization.", receiverId);
        }
    }
}