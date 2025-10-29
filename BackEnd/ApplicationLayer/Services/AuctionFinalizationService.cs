using Application.DTOs;
using Application.IRepositories;
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
            // Validate auction tồn tại và status là 'ended'
            if (auction == null)
            {
                _logger.LogWarning("Auction {AuctionId} not found during finalization.", auctionId);
                await _unitOfWork.RollbackTransactionAsync(); // Rollback vì không có gì để xử lý
                return; // Hoặc throw nếu cần báo lỗi rõ ràng
            }
            if (auction.Status != "ended")
            {
                _logger.LogWarning("Attempted to finalize auction {AuctionId} but its status is '{Status}', not 'ended'. Skipping.", auctionId, auction.Status);
                await _unitOfWork.RollbackTransactionAsync();
                return; // Bỏ qua nếu chưa kết thúc thực sự
            }


            // Tìm bid cao nhất và đang active (chưa bị outbid bởi chính nó hoặc người khác)
            var winningBid = await _unitOfWork.Bids.GetHighestActiveBidAsync(auctionId);

            // Xử lý không có ai bid
            if (winningBid == null)
            {
                _logger.LogInformation($"Auction {auctionId} ended with no winning bids.");
                // Optional: Cập nhật trạng thái item về lại 'active' nếu cần
                var itemNoBids = await _unitOfWork.Items.GetByIdAsync(auction.ItemId);
                if (itemNoBids != null && itemNoBids.Status == "pending_auction") // Giả sử có status này
                {
                    itemNoBids.Status = "active";
                    _unitOfWork.Items.Update(itemNoBids);
                    await _unitOfWork.SaveChangesAsync(); // Lưu thay đổi status item
                    _logger.LogInformation($"Updated Item {auction.ItemId} status back to active as auction had no bids.");
                }
                await _unitOfWork.CommitTransactionAsync(); // Commit transaction trống
                return;
            }

            // Đánh dấu bid thắng cuộc
            await _unitOfWork.Bids.UpdateBidStatusAsync(winningBid.BidId, "winner");
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

            decimal commissionFee = 0; // TODO: Tính phí hoa hồng dựa trên winningAmount
            decimal amountToSeller = winningAmount - commissionFee;

            // Cập nhật ví người bán: Cộng tiền vào balance
            bool updateSellerWalletSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(sellerWallet.WalletId, amountToSeller, 0); // Chỉ cập nhật balance
            if (!updateSellerWalletSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Failed to update seller wallet {sellerWallet.WalletId}.");
            }

            // Tạo transaction payout cho người bán
            var payoutTransaction = new WalletTransaction
            {
                WalletId = sellerWallet.WalletId,
                Amount = amountToSeller,
                Type = "auction_payout",
                CreatedAt = DateTime.Now,
                RefId = winningBid.BidId, // Liên kết với bid thắng
                AuctionId = auctionId
            };
            await _unitOfWork.WalletTransactions.CreateTransactionAsync(payoutTransaction);
            _logger.LogInformation($"Credited {amountToSeller} to seller User {sellerId} wallet {sellerWallet.WalletId}.");
            // --- Kết thúc xử lý người bán ---

            // --- Xử lý người thắng ---
            var winnerWallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(winnerId);
            if (winnerWallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"Winner wallet {winnerId} not found.");
            }
            // Cập nhật ví người thắng: Giảm held_balance (vì tiền đã chuyển đi)
            bool updateWinnerWalletSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(winnerWallet.WalletId, 0, -winningAmount); // Chỉ giảm held
            if (!updateWinnerWalletSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Failed to update winner wallet {winnerWallet.WalletId} held balance.");
            }
            // Transaction 'payment' hoặc tương tự đã được tạo khi 'hold', không cần tạo thêm transaction trừ tiền ở đây.
            _logger.LogInformation($"Decreased held balance by {winningAmount} for winner User {winnerId} wallet {winnerWallet.WalletId}.");
            // --- Kết thúc xử lý người thắng ---


            // --- Cập nhật Item Status và Tạo Order (Giữ nguyên logic cũ) ---
            var itemEntityToUpdate = itemWithSeller.Item; // Lấy Item entity từ kết quả trả về
            itemEntityToUpdate.Status = "sold";
            itemEntityToUpdate.UpdatedAt = DateTime.Now;
            _unitOfWork.Items.Update(itemEntityToUpdate); // Update Item entity
            _logger.LogInformation($"Updated Item {itemId} status to sold");

            // Tạo Order
            var winnerAddress = await _unitOfWork.Address.GetAddressDefaultByUserId(winnerId); // Lấy địa chỉ default
            if (winnerAddress == null)
            {
                _logger.LogWarning("Winner {WinnerId} does not have a default address.", winnerId);
                // Có thể lấy địa chỉ đầu tiên hoặc xử lý khác tùy yêu cầu
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
                AddressId = winnerAddress.AddressId, // Sử dụng địa chỉ tìm được
                Status = "paid", // Hoặc 'processing' tùy logic sau đó
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            await _unitOfWork.Orders.AddAsync(newOrder); // AddAsync của repo
            await _unitOfWork.SaveChangesAsync(); // Save để lấy OrderId
            _logger.LogInformation("Created Order {OrderId} for winner User {WinnerId}", newOrder.OrderId, winnerId);

            // Tạo OrderItem
            var newOrderItem = new OrderItem
            {
                OrderId = newOrder.OrderId,
                BuyerId = winnerId, // Lưu lại buyer_id ở đây nếu cần truy vấn cart/history dễ hơn
                ItemId = itemId,
                Quantity = 1, // Giả định số lượng là 1 cho đấu giá
                Price = winningAmount,
                IsDeleted = false
            };
            await _unitOfWork.OrderItems.CreateAsync(newOrderItem); // CreateAsync của repo
            await _unitOfWork.SaveChangesAsync(); // Save OrderItem
            _logger.LogInformation($"Added Item {itemId} to Order {newOrder.OrderId}");
            // --- Kết thúc cập nhật Item và Order ---


            // --- Xử lý hoàn tiền cho người thua ---
            var loserBids = await _unitOfWork.Bids.GetAllLoserActiveOrOutbidBidsAsync(auctionId, winnerId); // Lấy tất cả bid active/outbid không phải của winner

            foreach (var loserBid in loserBids)
            {
                // Tìm giao dịch 'hold' tương ứng với bid này
                var holdTransaction = await _unitOfWork.WalletTransactions.FindHoldTransactionByRefIdAsync(loserBid.BidId); // Cần thêm method này
                if (holdTransaction == null)
                {
                    _logger.LogWarning("Could not find corresponding 'hold' transaction for loser Bid {BidId} (User {UserId}). Skipping release.", loserBid.BidId, loserBid.UserId);
                    await _unitOfWork.Bids.UpdateBidStatusAsync(loserBid.BidId, "released"); // Đánh dấu đã xử lý để tránh lặp lại
                    continue;
                }

                // Số tiền cần hoàn trả là số tiền đã hold cho bid đó (lấy từ transaction)
                // Lưu ý: transaction amount là số âm, nên cần lấy giá trị tuyệt đối hoặc *-1
                decimal amountToRelease = -holdTransaction.Amount;

                // Cập nhật ví người thua: Cộng lại balance, giảm held_balance
                bool updateLoserWallet = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(holdTransaction.WalletId, amountToRelease, -amountToRelease);
                if (!updateLoserWallet)
                {
                    // Ghi log lỗi nghiêm trọng nhưng không nên dừng cả quá trình chỉ vì 1 user lỗi
                    _logger.LogError("CRITICAL: Failed to release funds for loser Bid {BidId} / User {UserId} / Wallet {WalletId}. Amount: {Amount}. MANUAL INTERVENTION NEEDED.",
                       loserBid.BidId, loserBid.UserId, holdTransaction.WalletId, amountToRelease);
                    // Không throw lỗi ở đây, tiếp tục xử lý user khác
                    continue; // Bỏ qua user này
                }

                // Tạo transaction 'release'
                var releaseTransaction = new WalletTransaction
                {
                    WalletId = holdTransaction.WalletId,
                    Amount = amountToRelease, // Số dương
                    Type = "release",
                    CreatedAt = DateTime.Now,
                    RefId = loserBid.BidId, // Liên kết với bid thua
                    AuctionId = auctionId
                };
                await _unitOfWork.WalletTransactions.CreateTransactionAsync(releaseTransaction);

                // Cập nhật status bid thua thành 'released'
                await _unitOfWork.Bids.UpdateBidStatusAsync(loserBid.BidId, "released");
                _logger.LogInformation($"Released {amountToRelease} for loser Bid {loserBid.BidId} / User {loserBid.UserId}");

                // Gửi thông báo hoàn tiền
                await SendNotificationAsync(
                        senderId: null, receiverId: loserBid.UserId,
                        title: $"Đấu giá #{auctionId} kết thúc - Hoàn tiền",
                        message: $"Số tiền {amountToRelease:N0}đ đã được hoàn lại vào ví của bạn từ phiên đấu giá cho sản phẩm '{itemEntityToUpdate.Title}'.");
            }
            // --- Kết thúc xử lý người thua ---


            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully finalized Auction {AuctionId}", auctionId);

            // Gửi thông báo cho người thắng và người bán (sau khi commit thành công)
            await SendNotificationAsync(
                    senderId: null, receiverId: winnerId,
                    title: $"Chúc mừng! Bạn đã thắng đấu giá #{auctionId}",
                    message: $"Bạn đã thắng phiên đấu giá cho sản phẩm '{itemEntityToUpdate.Title}' với giá {winningAmount:N0}đ. Đơn hàng #{newOrder.OrderId} đã được tạo.");

            await SendNotificationAsync(
                senderId: null, receiverId: sellerId,
                title: $"Sản phẩm '{itemEntityToUpdate.Title}' đã được bán qua đấu giá #{auctionId}",
                message: $"Sản phẩm của bạn đã được bán với giá {winningAmount:N0}đ. Số tiền {amountToSeller:N0}đ (sau phí) đã được chuyển vào ví.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finalizing Auction {AuctionId}. Rolling back transaction.", auctionId);
            await _unitOfWork.RollbackTransactionAsync();
            throw; // Ném lại lỗi
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