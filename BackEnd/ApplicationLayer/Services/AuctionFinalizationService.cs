using Application.DTOs;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class AuctionFinalizationService : IAuctionFinalizationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuctionFinalizationService> _logger;
    private readonly INotificationService _notificationService;
    private const string AuctionSellerFeeCode = "AUCTION_SELLER_FEE"; // FIXME: mock value
    private const string AuctionNotificationType = "activities";

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
            if (auction == null || auction.Status != "ended")
            {
                _logger.LogWarning("Auction with ID: {AuctionId} not found.", auctionId);
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Auction with ID {auctionId} not found.");
            }

            var winningBid = await _unitOfWork.Bids.GetHighestBidAsync(auctionId);
            if (winningBid == null)
            {
                _logger.LogInformation($"Auction {auctionId} ended with no bids.");
                await _unitOfWork.CommitTransactionAsync();
                return;
            }

            _logger.LogInformation($"Auction {auctionId} winner: User {winningBid.UserId} with amount {winningBid.BidAmount}");

            var winnerId = winningBid.UserId;
            var winningAmount = winningBid.BidAmount;
            var itemId = auction.ItemId;

            // process seller
            var item = await _unitOfWork.Items.GetByIdAsync(itemId);
            if (item == null)
            {
                throw new InvalidOperationException($"Item with ID {itemId} not found.");
            }

            // get seller id from item
            var itemWithSeller = await _unitOfWork.Items.GetItemWithSellerByItemIdAsync(itemId);
            if (itemWithSeller?.Seller == null) throw new InvalidOperationException($"Could not find owner for item {itemId}.");
            int sellerId = itemWithSeller.Seller.UserId;

            var sellerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(sellerId);
            if (sellerWallet == null)
            {
                throw new InvalidOperationException($"Seller wallet for user ID {sellerId} not found.");
            }

            decimal amountToReceive = winningAmount;    // TODO: add commission calculation
            await _unitOfWork.Wallets.UpdateBalanceAsync(sellerWallet.WalletId, amountToReceive);

            var payoutTransaction = new Domain.Entities.WalletTransaction
            {
                WalletId = sellerWallet.WalletId,
                Amount = amountToReceive,
                Type = "auction_payout",
                CreatedAt = DateTime.Now,
                RefId = winningBid.BidId
            };
            await _unitOfWork.WalletTransactions.CreateTransactionAsync(payoutTransaction);
            _logger.LogInformation($"Credited {amountToReceive} to seller User {sellerId}");

            item.Status = "sold";
            item.UpdatedAt = DateTime.Now;
            if (item == null)
            {
                throw new InvalidOperationException($"Item with ID {itemId} not found.");
            }
            else _unitOfWork.Items.Update(item);
            _logger.LogInformation($"Updated Item {itemId} status to sold");

            var newOrder = new Order
            {
                BuyerId = winnerId,
                AddressId = 1, // FIXME: need to get default address
                Status = "completed",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var createdOrder = _unitOfWork.Orders.AddAsync(newOrder);
            if (createdOrder == null || createdOrder.Id <= 0)
            {
                throw new InvalidOperationException($"Failed to create order for auction {auctionId}.");
            }
            _logger.LogInformation("Created Order {OrderId} for winner User {WinnerId}", createdOrder.Id, winnerId);

            _logger.LogInformation($"Created Order {newOrder.OrderId} for winner User {winnerId}");
            var newOrderItem = new OrderItem
            {
                OrderId = newOrder.OrderId,
                BuyerId = winnerId,
                ItemId = itemId,
                Quantity = 1, //FIXME: quantity handling
                Price = winningAmount,
                IsDeleted = false
            };

            await _unitOfWork.OrderItems.CreateAsync(newOrderItem);
            _logger.LogInformation($"Added Item {itemId} to Order {newOrder.OrderId}");

            var allBids = await _unitOfWork.Bids.GetBidsByAuctionIdAsync(auctionId);
            var loserBids = allBids.Where(b => b.UserId != winnerId)
                                   .GroupBy(b => b.UserId)
                                   .Select(g => g.OrderByDescending(b => b.BidAmount).First())
                                   .ToList();

            foreach (var loserBid in loserBids)
            {
                _logger.LogInformation($"Processing release for loser User {loserBid.UserId}, highest bid {loserBid.BidAmount}");
                var loserWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(loserBid.UserId);
                if (loserWallet == null)
                {
                    _logger.LogWarning($"Wallet for loser User {loserBid.UserId} not found. Cannot release funds.");
                    continue;
                }
                // Important: Check if the corresponding hold transaction has been released
                bool alreadyReleased = await _unitOfWork.WalletTransactions.HasTransactionOfTypeWithRefIdAsync("release", loserBid.BidId);
                if (alreadyReleased)
                {
                    _logger.LogWarning($"Funds for Bid {loserBid.BidId} already released for User {loserBid.UserId}. Skipping.");
                    continue;
                }
                // Only release if they have active hold trades
                bool updateLoserSuccess = await _unitOfWork.Wallets.UpdateBalanceAsync(loserWallet.WalletId, loserBid.BidAmount);
                if (!updateLoserSuccess)
                {
                    _logger.LogError($"Failed to update balance for loser Wallet {loserWallet.WalletId}.");
                    // In transaction, this error will rollback all -> Safer
                    throw new Exception($"Failed to update balance for loser Wallet {loserWallet.WalletId}.");
                }

                var releaseTransaction = new WalletTransaction
                {
                    WalletId = loserWallet.WalletId,
                    Amount = loserBid.BidAmount,
                    Type = "release",
                    CreatedAt = DateTime.Now,
                    RefId = loserBid.BidId // Link to the highest bid of loser
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(releaseTransaction);
                _logger.LogInformation($"Released {loserBid.BidAmount} for loser User {loserBid.UserId}");
                await SendNotificationAsync(
                        senderId: null, // Hệ thống gửi
                        receiverId: loserBid.UserId,
                        title: $"Đấu giá #{auctionId} kết thúc - Hoàn tiền",
                        message: $"Số tiền {loserBid.BidAmount:N0}đ đã được hoàn lại vào ví của bạn từ phiên đấu giá cho sản phẩm '{itemWithSeller.Item.Title}'.");
            }
            // If everything succeeds, commit the transaction
            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully finalized Auction {AuctionId}", auctionId);

            await SendNotificationAsync(
                    senderId: null, receiverId: winnerId,
                    title: $"Chúc mừng! Bạn đã thắng đấu giá #{auctionId}",
                    message: $"Bạn đã thắng phiên đấu giá cho sản phẩm '{itemWithSeller.Item.Title}' với giá {winningAmount:N0}đ. Đơn hàng #{createdOrder.Id} đã được tạo.");

            await SendNotificationAsync(
                senderId: null, receiverId: sellerId,
                title: $"Sản phẩm '{itemWithSeller.Item.Title}' đã được bán qua đấu giá #{auctionId}",
                message: $"Sản phẩm của bạn đã được bán với giá {winningAmount:N0}đ. Số tiền {amountToReceive:N0}đ (sau phí) đã được chuyển vào ví.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finalizing Auction {AuctionId}. Rolling back transaction.", auctionId);
            await _unitOfWork.RollbackTransactionAsync();
            // Re-throw để báo lỗi cho tiến trình gọi (vd: Scheduled Job)
            throw;
        }
    }

    private async Task SendNotificationAsync(int? senderId, int receiverId, string title, string message)
    {
        try
        {
            var notificationDto = new CreateNotificationDTO
            {
                NotiType = AuctionNotificationType,
                SenderId = senderId,
                TargetUserId = receiverId.ToString(),
                Title = title,
                Message = message
            };
            await _notificationService.AddNewNotification(notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification to User {ReceiverId} regarding Auction finalization.", receiverId);
        }
    }
}