using Application.DTOs;
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
    

    private const string AuctionSellerFeeCode = "AUCTION_SELLER_FEE"; // FIXME: mock value
    private const string AuctionNotificationType = "Activities";

    public AuctionFinalizationService(IUnitOfWork unitOfWork, ILogger<AuctionFinalizationService> logger, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task FinalizeAuctionAsync(int auctionId)
    {
        _logger.LogInformation("Finalizing auction with ID: {AuctionId}", auctionId);
        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
            // Validate auction exised and status is 'ended'
            if (auction == null)
            {
                _logger.LogWarning("Auction {AuctionId} not found during finalization.", auctionId);
                await _unitOfWork.RollbackTransactionAsync(); // Rollback
                return;
            }

            if (auction.Status != AuctionStatus.Ongoing.ToString())
            {
                _logger.LogWarning("Attempted to finalize auction {AuctionId} but its status is '{Status}', not 'ongoing'. Skipping.", auctionId, auction.Status);
                await _unitOfWork.RollbackTransactionAsync();
                return;
            }
            auction.Status =  AuctionStatus.Ended.ToString();
            auction.UpdatedAt = DateTime.Now; 
            await _unitOfWork.Auctions.Update(auction); 
            _logger.LogInformation("Auction {AuctionId} status updated to 'ended' within transaction.", auctionId);

            // get highest bid and is active (not outbid by itself or others)
            var winningBid = await _unitOfWork.Bids.GetHighestActiveBidAsync(auctionId);

            // No bidder
            if (winningBid == null)
            {
                _logger.LogInformation($"Auction {auctionId} ended with no winning bids.");
                // Optional: Cập nhật trạng thái item về lại 'active' nếu cần
                var itemNoBids = await _unitOfWork.Items.GetByIdAsync(auction.ItemId);
                if (itemNoBids != null && itemNoBids.Status == "pending_auction") // Giả sử có status này
                {
                    itemNoBids.Status = ItemStatus.Active.ToString();
                    _unitOfWork.Items.Update(itemNoBids);
                    await _unitOfWork.SaveChangesAsync(); // Save changes to item status
                    _logger.LogInformation($"Updated Item {auction.ItemId} status back to active as auction had no bids.");
                }
                await _unitOfWork.CommitTransactionAsync(); // Commit transaction to save, end transaction
                return;
            }

            // Đánh dấu bid thắng cuộc
            await _unitOfWork.Bids.UpdateBidStatusAsync(winningBid.BidId, BidStatus.Winner.ToString());
            _logger.LogInformation($"Auction {auctionId} winner: User {winningBid.UserId} with Bid {winningBid.BidId} amount {winningBid.BidAmount}");

            var winnerId = winningBid.UserId;
            var winningAmount = winningBid.BidAmount;
            var itemId = auction.ItemId;

            // --- Xử lý người bán (Lấy seller, tính phí, chuyển tiền) ---
            var itemWithSeller = await _unitOfWork.Items.GetItemAndSellerByItemIdAsync(itemId);
            if (itemWithSeller?.Seller == null || itemWithSeller.Item == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Could not find owner for item {itemId}.");
            }
            int sellerId = itemWithSeller.Seller.UserId;
            var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
            if (sellerWallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Seller wallet for user ID {sellerId} not found.");
            }

            // --- Handle the winner ---
            var winnerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(winnerId);
            if (winnerWallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Winner wallet {winnerId} not found.");
            }
            // Update winner wallet: Decrease held_balance (since funds have been transferred)
            bool updateWinnerWalletSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(winnerWallet.WalletId, 0, -winningAmount); //  only reduce held 
            if (!updateWinnerWalletSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Failed to update winner wallet {winnerWallet.WalletId} held balance.");
            }

            // --- End of winner processing ---


            // --- Updadte Item Status và create Order ---
            var itemEntityToUpdate = itemWithSeller.Item; // get the seller's auction item
            itemEntityToUpdate.Status = ItemStatus.Sold.ToString();
            itemEntityToUpdate.UpdatedAt = DateTime.Now;
            _unitOfWork.Items.Update(itemEntityToUpdate); // Update Item entity
            _logger.LogInformation($"Updated Item {itemId} status to sold");

            // create Order
            var winnerAddress = await _unitOfWork.Address.GetAddressDefaultByUserId(winnerId); // get default default
            if (winnerAddress == null)
            {
                _logger.LogWarning("Winner {WinnerId} does not have a default address.", winnerId);
                // 
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
                BuyerId = winnerId,
                AddressId = winnerAddress.AddressId, 
                Status = OrderStatus.Pending.ToString(), 
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            await _unitOfWork.Orders.AddAsync(newOrder);
            await _unitOfWork.SaveChangesAsync(); // Save to get OrderId
            _logger.LogInformation("Created Order {OrderId} for winner User {WinnerId}", newOrder.OrderId, winnerId);

            var paymentTransaction = new WalletTransaction
            {
                WalletId = winnerWallet.WalletId,
                Amount = -winningAmount, 
                Type = WalletTransactionType.Payment.ToString(),
                CreatedAt = DateTime.Now,
                RefId = newOrder.OrderId,
                AuctionId = auctionId,
                OrderId = newOrder.OrderId
            };
            await _unitOfWork.WalletTransactions.CreateTransactionAsync(paymentTransaction);
            _logger.LogInformation($"Decreased held balance by {winningAmount} for winner User {winnerId} and created 'payment' transaction.");

            // create OrderItem
            var newOrderItem = new OrderItem
            {
                OrderId = newOrder.OrderId,
                BuyerId = winnerId, // Save buyer_id here if you need to query cart/history easier
                ItemId = itemId,
                Quantity = itemWithSeller.Item.Quantity,
                Price = winningAmount,
                IsDeleted = false
            };
            await _unitOfWork.OrderItems.CreateAsync(newOrderItem); 

            await _unitOfWork.SaveChangesAsync(); // Save OrderItem

            _logger.LogInformation($"Added Item {itemId} to Order {newOrder.OrderId}");
            // --- Finish updating Item and Order ---


            // --- Process refunds for losers ---
            var loserBids = await _unitOfWork.Bids.GetAllLoserActiveOrOutbidBidsAsync(auctionId, winnerId);
            // Get all active/outbid bids that are not from the winner

            foreach (var loserBid in loserBids)
            {
                // Find the 'hold' transaction corresponding to this bid
                var holdTransaction = await _unitOfWork.WalletTransactions.FindHoldTransactionByRefIdAsync(loserBid.BidId);
                if (holdTransaction == null)
                {
                    _logger.LogWarning("Could not find corresponding 'hold' transaction for loser Bid {BidId} (User {UserId}). Skipping release.", loserBid.BidId, loserBid.UserId);
                    await _unitOfWork.Bids.UpdateBidStatusAsync(loserBid.BidId, "released");
                    // Mark processed to avoid repetition
                    continue;
                }

                // The amount to be refunded is the amount held for that bid (taken from the transaction)
                // Note: transaction amount is negative, so need to take absolute value
                decimal amountToRelease = -holdTransaction.Amount;

                // Update loser's wallet: Add balance, decrease held_balance
                bool updateLoserWallet = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(holdTransaction.WalletId, amountToRelease, -amountToRelease);
                if (!updateLoserWallet)
                {
                    // Log critical errors but don't stop the whole process just because of one user error
                    _logger.LogError("CRITICAL: Failed to release funds for loser Bid {BidId} / User {UserId} / Wallet {WalletId}. Amount: {Amount}. MANUAL INTERVENTION NEEDED.",
                       loserBid.BidId, loserBid.UserId, holdTransaction.WalletId, amountToRelease);
                    // Don't throw an error here, continue processing other users
                    continue; // Ignore this user
                }

                // create transaction 'release'
                var releaseTransaction = new WalletTransaction
                {
                    WalletId = holdTransaction.WalletId,
                    Amount = amountToRelease, // Positive numbers
                    Type = WalletTransactionType.Released.ToString(),
                    CreatedAt = DateTime.Now,
                    RefId = loserBid.BidId, // Link to losing bid
                    AuctionId = auctionId
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(releaseTransaction);

                // Update 'outbid' status to 'released'
                await _unitOfWork.Bids.UpdateBidStatusAsync(loserBid.BidId, "released");
                _logger.LogInformation($"Released {amountToRelease} for loser Bid {loserBid.BidId} / User {loserBid.UserId}");

                // Send refund notification
                await SendNotificationAsync(
                        senderId: null, receiverId: loserBid.UserId,
                        title: $"Đấu giá #{auctionId} kết thúc - Hoàn tiền",
                        message: $"Số tiền {amountToRelease:N0}đ đã được hoàn lại vào ví của bạn từ phiên đấu giá cho sản phẩm '{itemEntityToUpdate.Title}'.");
            }
            // --- End of loser processing ---


            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully finalized Auction {AuctionId}", auctionId);

            // Send notification to winner and seller (after successful commit)

            var winnerNoti = new CreateNotificationDto
            {
                NotiType = NotificationType.Activities.ToString(),
                TargetUserId = winnerId.ToString(),  
                Title = "You have won the auction!",
                Message = $"Congratulations! You won the auction for item {itemId}."
            };

            _ = _notificationService.AddNewNotification(winnerNoti, 0, "");

            await _notificationService.SendNotificationAsync(
                message: winnerNoti.Message,
                targetUserId: winnerNoti.TargetUserId
            );



            var sellerName = await _unitOfWork.Users.GetByIdAsync((int)sellerId);

            var sellerNotiDto = new CreateNotificationDto
            {
                NotiType = NotificationType.Auction.ToString(),
                TargetUserId = sellerId.ToString(), 
                Title = "Your auction has ended!",
                Message = $"{sellerName?.FullName ?? "Someone"}'s item has been won by user ID {winnerId}."
            };

            _ = _notificationService.AddNewNotification(sellerNotiDto, 0, "");

            await _notificationService.SendNotificationAsync(
                message: sellerNotiDto.Message,
                targetUserId: sellerNotiDto.TargetUserId
            );

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