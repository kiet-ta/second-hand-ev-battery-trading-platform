using Application.DTOs;
using Application.DTOs.AuctionDtos;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace Application.Services;

public class AuctionService : IAuctionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuctionService> _logger;
    private readonly INotificationService _notificationService;
    private readonly IAuctionFinalizationService _auctionFinalizationService;
    public AuctionService(
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IAuctionFinalizationService auctionFinalizationService,
        ILogger<AuctionService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _notificationService = notificationService;
        _auctionFinalizationService = auctionFinalizationService;
    }

    private DateTime now = DateTime.Now;
    public async Task<IEnumerable<BidderHistoryDto>> GetBidderHistoryAsync(int auctionId)
    {
        var auctionExists = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
        if (auctionExists == null)
            throw new KeyNotFoundException($"Auction with ID {auctionId} not found.");
        var bids = await _unitOfWork.Bids.GetBidsByAuctionIdAsync(auctionId);
        if (!bids.Any())
            return Enumerable.Empty<BidderHistoryDto>();
        var userIds = bids.Select(b => b.UserId).Distinct().ToHashSet();
        var users = (await _unitOfWork.Users.GetAllAsync()).Where(u => userIds.Contains(u.UserId)).ToDictionary(u => u.UserId);

        var history = bids.Select(Bid =>
        {
            users.TryGetValue(Bid.UserId, out var user);
            return new BidderHistoryDto
            {
                UserId = Bid.UserId,
                FullName = user?.FullName ?? "Unknown",
                BidAmount = Bid.BidAmount,
                BidTime = Bid.BidTime
            };
        })
            .OrderByDescending(b => b.BidTime)
            .ToList();
        return history;
    }

    public async Task BuyNowAuctionAsync(int auctionId, int userId)
    {
        // 1. Initial Validation
        var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
        if (auction == null) throw new KeyNotFoundException($"Auction with ID {auctionId} not found.");
        

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) throw new KeyNotFoundException($"User with ID {userId} not found.");
        
        var item = await _unitOfWork.Items.GetByIdAsync(auction.ItemId);
        if (item == null) throw new KeyNotFoundException($"Item for auction {auctionId} not found.");

        // Validate Auction Status
        if (auction.Status != AuctionStatus.Ongoing.ToString()) throw new InvalidOperationException("Auction is not currently active.");
        if (item.Price == null || item.Price <= 0) throw new InvalidOperationException("This auction does not support 'Buy Now' option.");

        await _auctionFinalizationService.FinalizeAuctionAsync(auctionId);
    }

    public async Task<AuctionDto?> GetAuctionByItemIdAsync(int itemId)
    {
        var auction = await _unitOfWork.Auctions.GetByItemIdAsync(itemId);
        if (auction == null)
        {
            return null;
        }
        return await MapToAuctionDto(auction);
    }

    public async Task<AuctionListResponse> GetAuctionsAsync(int page = 1, int pageSize = 10, string? status = null)
    {
        var (auctions, total) = await _unitOfWork.Auctions.GetAuctionsWithPaginationAsync(page, pageSize, status);

        var auctionDtos = new List<AuctionDto>();

        foreach (var auction in auctions)
        {
            var auctionDto = await MapToAuctionDto(auction);
            if (auctionDto != null)
            {
                auctionDtos.Add(auctionDto);
            }
        }

        return new AuctionListResponse
        {
            Status = "success",
            Data = auctionDtos,
            Meta = new AuctionMeta
            {
                Total = total,
                Page = page,
                PageSize = pageSize
            }
        };
    }

    public async Task<AuctionDto?> GetAuctionByIdAsync(int auctionId)
    {
        var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
        if (auction == null) return null;

        return await MapToAuctionDto(auction);
    }

    public async Task<CreateAuctionResponse> CreateAuctionAsync(CreateAuctionRequest request)
    {
        // validate item exists
        var item = await _unitOfWork.Items.GetByIdAsync(request.ItemId);
        if (item == null) throw new KeyNotFoundException($"Item {request.ItemId} not found.");

        // validate starting price < buy now price
        if (item.Price.HasValue && request.StartingPrice >= item.Price.Value)
        {
            throw new ArgumentException($"Giá khởi điểm ({request.StartingPrice:N0}) phải thấp hơn giá Mua Ngay/Giá niêm yết ({item.Price.Value:N0}).");
        }

        // check item has not in auction
        var existingAuction = await _unitOfWork.Auctions.GetByItemIdAsync(request.ItemId);
        if (existingAuction != null)
            throw new InvalidOperationException($"Item {request.ItemId} already has an auction.");

        // check time valid
        if (request.StartTime >= request.EndTime)
            throw new ArgumentException("Start time must be earlier than end time.");

        var auction = new Auction
        {
            ItemId = request.ItemId,
            StartingPrice = request.StartingPrice,
            CurrentPrice = null,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = DateTime.Now >= request.StartTime ? AuctionStatus.Ongoing.ToString() : AuctionStatus.Upcoming.ToString(),
            TotalBids = 0,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            StepPrice = request.StepPrice,
            IsBuyNow = request.IsBuyNow
        };

        await _unitOfWork.Auctions.CreateAsync(auction);
        _logger.LogInformation("Created Auction {AuctionId} for Item {ItemId}", auction.AuctionId, auction.ItemId);

        return new CreateAuctionResponse
        {
            AuctionId = auction.AuctionId,
            ItemId = auction.ItemId,
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.CurrentPrice,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status
        };
    }

    public async Task<BidderHistoryDto> PlaceBidAsync(int auctionId, int userId, decimal bidAmount)
    {
        User user;
        Bid? previousHighestBid = null;
        var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
        if (auction == null) throw new KeyNotFoundException($"Auction with ID {auctionId} not found.");

        var item = await _unitOfWork.Items.GetByIdAsync(auction.ItemId);
        if (item == null) throw new KeyNotFoundException($"Item for auction {auctionId} not found.");

        var now = DateTime.Now;

        if (auction.Status != AuctionStatus.Ongoing.ToString() || now < auction.StartTime || now > auction.EndTime)
            throw new InvalidOperationException("Auction is not active or has ended.");

        // check price buy now
        bool isBuyNowTrigger = auction.IsBuyNow;
        if (item.Price.HasValue && isBuyNowTrigger)
        {
            if (bidAmount > item.Price.Value)
            {
                throw new ArgumentException($"Bạn không thể đặt cao hơn giá Mua Ngay ({item.Price.Value:N0}). Hãy đặt bằng giá này để chốt đơn.");
            }
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Double-check auction status within transaction
            if (item.Price.HasValue && (auction.CurrentPrice ?? 0) >= item.Price.Value && isBuyNowTrigger)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("This item has been bought via Buy Now.");
            }
            var currentPrice = auction.CurrentPrice ?? auction.StartingPrice;
            if (!isBuyNowTrigger)
            {
                decimal requiredMinimumBid = currentPrice + auction.StepPrice;
                if (auction.TotalBids == 0) requiredMinimumBid = auction.StartingPrice;

                if (bidAmount < requiredMinimumBid)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw new ArgumentException($"Bid amount must be at least {requiredMinimumBid:N0}.");
                }
            }

            user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }

            var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(userId);
            if (wallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"User wallet for user ID {userId} not found.");
            }

            // We need to find the latest bid from this user that holds funds, 
            // regardless of whether it's currently 'Active' or has been 'Outbid'.
            var previousHeldBid = await _unitOfWork.Bids.GetUserLatestHeldBidAsync(auctionId, userId);
            decimal amountToHoldNow = 0;
            decimal previousHeldAmount = 0;

            if (previousHeldBid != null)
            {
                // Check constraint: New bid must be higher than user's own previous bid
                if (bidAmount <= previousHeldBid.BidAmount)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw new ArgumentException($"Your new bid must be higher than your current highest bid ({previousHeldBid.BidAmount:N0}).");
                }

                // Calculate the difference to hold
                previousHeldAmount = previousHeldBid.BidAmount;
                amountToHoldNow = bidAmount - previousHeldAmount;
            }
            else
            {
                // First time bidding (or previous bids were released), hold full amount
                amountToHoldNow = bidAmount;
            }

            // Check available balance
            if ((wallet.Balance - wallet.HeldBalance) < amountToHoldNow)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Insufficient available funds (considering held amounts).");
            }

            // Execute hold logic on wallet
            bool updateWalletSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(wallet.WalletId, -amountToHoldNow, amountToHoldNow);
            if (!updateWalletSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError("Failed to update wallet balance/held amount for Wallet {WalletId}.", wallet.WalletId);
                throw new Exception($"Failed to update wallet balances. WalletId: {wallet.WalletId}");
            }
            _logger.LogInformation("Successfully held {Amount} from Wallet {WalletId} (Held Balance: {HeldBalance})", amountToHoldNow, wallet.WalletId, wallet.HeldBalance + amountToHoldNow);

            // Create new Bid entity
            var newBid = new Bid()
            {
                AuctionId = auctionId,
                UserId = userId,
                BidAmount = bidAmount,
                BidTime = now,
                Status = BidStatus.Active.ToString()
            };
            int newBidId = await _unitOfWork.Bids.PlaceBidAsync(newBid);
            newBid.BidId = newBidId;

            // Record Transaction
            var holdTransaction = new WalletTransaction()
            {
                WalletId = wallet.WalletId,
                Amount = -amountToHoldNow,
                Type = WalletTransactionType.Hold.ToString(),
                CreatedAt = now,
                RefId = newBid.BidId,
                AuctionId = auctionId
            };
            await _unitOfWork.WalletTransactions.CreateTransactionAsync(holdTransaction);
            _logger.LogInformation("Created 'hold' transaction {TransactionId} for Bid {BidId} (Amount: {Amount})", holdTransaction.TransactionId, newBid.BidId, amountToHoldNow);

            // Update status of previous bid if it was Active
            // Note: If it was already 'Outbid', don't need to change it, but changing it to 'Outbid' again doesn't hurt.
            if (previousHeldBid != null && previousHeldBid.Status == BidStatus.Active.ToString())
            {
                await _unitOfWork.Bids.UpdateBidStatusAsync(previousHeldBid.BidId, BidStatus.OutBid.ToString());
                _logger.LogInformation("Updated previous bid {PreviousBidId} for User {UserId} to 'outbid'.", previousHeldBid.BidId, userId);
            }

            // Find the Global Highest Bid (to notify them) - Exclude the bid we just created
            previousHighestBid = await _unitOfWork.Bids.GetHighestActiveBidAsync(auctionId, excludeBidId: newBidId);

            // Update the previous global winner to 'outbid'
            if (previousHighestBid != null && previousHighestBid.UserId != userId)
            {
                await _unitOfWork.Bids.UpdateBidStatusAsync(previousHighestBid.BidId, BidStatus.OutBid.ToString());
                _logger.LogInformation("User {PreviousHighestUserId}'s bid {PreviousHighestBidId} is now 'outbid'.", previousHighestBid.UserId, previousHighestBid.BidId);
            }


            var newBidHistory = new BidderHistoryDto
            {
                UserId = userId,
                FullName = user.FullName ?? "Anonymous Bidder",
                BidAmount = bidAmount,
                BidTime = newBid.BidTime
            };
            _logger.LogInformation("Successfully placed bid {BidId} for User {UserId} in Auction {AuctionId}. Amount: {BidAmount}. Transaction committed.", newBid.BidId, userId, auctionId, bidAmount);

            // Notification logic
            if (previousHighestBid != null)
            {
                var outbidMessage = $"You have been outbid on auction #{auctionId}. The new price is {bidAmount:N0}đ.";
                var notiDto = new CreateNotificationDto
                {
                    NotiType = NotificationType.Auction.ToString(),
                    TargetUserId = previousHighestBid.UserId.ToString(),
                    Title = "You have been outbid!",
                    Message = outbidMessage
                };
                _ = _notificationService.AddNewNotification(notiDto, 0, "");

                await _notificationService.SendNotificationAsync(
               message: outbidMessage,
               targetUserId: notiDto.TargetUserId);
            }

            auction.CurrentPrice = bidAmount;
            auction.TotalBids += 1;

            if (isBuyNowTrigger)
            {
                auction.EndTime = DateTime.Now.AddSeconds(-1);
                _logger.LogInformation($"User {userId} triggered Buy Now via PlaceBid. Auction {auctionId} closed.");
            }

            _unitOfWork.Auctions.Update(auction);
            await _unitOfWork.SaveChangesAsync();

            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation($"Bid {newBid.BidId} placed successfully.");


            if (isBuyNowTrigger)
            {
                _ = _auctionFinalizationService.FinalizeAuctionAsync(auctionId);
            }
            return newBidHistory;

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PlaceBidAsync for Auction {AuctionId}, User {UserId}. Rolling back transaction.", auctionId, userId);
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task UpdateAuctionStatusesAsync()
    {
        var upcomingAuctions = await _unitOfWork.Auctions.GetUpcomingAuctionsAsync();

        foreach (var auction in upcomingAuctions)
        {
            if (auction.StartTime < now && auction.Status == AuctionStatus.Upcoming.ToString())
                await _unitOfWork.Auctions.UpdateStatusAsync(auction, AuctionStatus.Ongoing.ToString());
        }

        // Update ongoing to ended
        var ongoingAuctions = await _unitOfWork.Auctions.GetActiveAuctionsAsync();

        foreach (var auction in ongoingAuctions)
        {
            if (auction.EndTime < now)
                await _unitOfWork.Auctions.UpdateStatusAsync(auction, AuctionStatus.Ended.ToString());
        }
    }

    private async Task<AuctionDto?> MapToAuctionDto(Auction auction)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(auction.ItemId);
        if (item == null) return null;
        var image = await _unitOfWork.ItemImages.GetByItemIdAsync(item.ItemId);

        var auctionDto = new AuctionDto
        {
            AuctionId = auction.AuctionId,
            ItemId = auction.ItemId,
            Title = item.Title,
            Type = item.ItemType ?? "unknown",
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.CurrentPrice,
            IsBuyNow = auction.IsBuyNow,
            TotalBids = auction.TotalBids,
            StepPrice = auction.StepPrice,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status,
            Images = image.Select(img => new ItemImageDto
            {
                ImageId = img.ImageId,
                ImageUrl = img.ImageUrl
            }).ToList()
        };

        // Get specific details based on item type
        switch (item.ItemType?.ToLower())
        {
            case "Ev":
                var evDetail = await _unitOfWork.EVDetails.GetByIdAsync(auction.ItemId);
                if (evDetail != null)
                {
                    auctionDto.Title = $"{evDetail.Model} {evDetail.Version}".Trim();
                }
                break;

            case "Battery":
                var batteryDetail = await _unitOfWork.BatteryDetails.GetByIdAsync(auction.ItemId);
                if (batteryDetail != null)
                {
                    auctionDto.Title = $"{item.Title}";
                }
                break;

            default:
                break;
        }

        return auctionDto;
    }

    public async Task<AuctionStatusDto> GetAuctionStatusAsync(int auctionId)
    {
        var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);
        if (auction == null)
            throw new KeyNotFoundException("Auction not found."); //404

        string status;

        if (now < auction.StartTime)
            status = AuctionStatus.Upcoming.ToString();
        else if (now >= auction.StartTime && now < auction.EndTime)
            status = AuctionStatus.Ongoing.ToString();
        else
            status = AuctionStatus.Ended.ToString();

        return new AuctionStatusDto
        {
            AuctionId = auction.AuctionId,
            Status = status,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime
        };
    }

    public async Task<AuctionListResponse> GetAllAuctionsAsync(int page, int pageSize)
    {
        var auctions = await _unitOfWork.Auctions.GetAllAsync(page, pageSize);
        var totalCount = await _unitOfWork.Auctions.GetTotalCountAsync();

        foreach (var a in auctions)
        {
            a.Status = now < a.StartTime ? AuctionStatus.Upcoming.ToString() :
                       now >= a.StartTime && now < a.EndTime ? AuctionStatus.Ongoing.ToString() : AuctionStatus.Ended.ToString();
        }

        return new AuctionListResponse
        {
            Status = "success",
            Data = auctions,
            Meta = new AuctionMeta
            {
                Total = totalCount,
                Page = page,
                PageSize = pageSize
            }
        };
    }

    public async Task<IEnumerable<AuctionDto>> GetAuctionsByUserId(int userId)
    {
        var auctions = await _unitOfWork.Auctions.GetAuctionsByUserIdAsync(userId);
        var auctionDtos = new List<AuctionDto>();
        foreach (var auc in auctions)
        {
            var auctionDto = await MapToAuctionDto(auc);
            if (auctionDto != null)
            {
                auctionDtos.Add(auctionDto);
            }
        }
        return auctionDtos;
    }
}