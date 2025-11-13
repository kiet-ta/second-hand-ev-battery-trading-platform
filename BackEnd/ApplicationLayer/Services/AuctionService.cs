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
    private readonly IAuctionRepository _auctionRepository;
    private readonly IUserContextService _userContextService;
    private readonly IBidRepository _bidRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;
    private readonly IItemRepository _itemRepository;
    private readonly IItemImageRepository _itemImageRepository;
    private readonly IEVDetailRepository _eVDetailRepository;
    private readonly IBatteryDetailRepository _batteryDetailRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuctionService> _logger;
    private readonly INotificationService _notificationService;
    public AuctionService(
        IAuctionRepository auctionRepository,
        IBidRepository bidRepository,
        IWalletRepository walletRepository,
        IWalletTransactionRepository walletTransactionRepository,
        IItemRepository itemRepository,
        IEVDetailRepository eVDetailRepository,
        IBatteryDetailRepository batteryDetailRepository,
        IUserRepository userRepository,
        IItemImageRepository itemImageRepository,
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IUserContextService userContextService,
        ILogger<AuctionService> logger)
    {
        _auctionRepository = auctionRepository;
        _bidRepository = bidRepository;
        _walletRepository = walletRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _itemRepository = itemRepository;
        _eVDetailRepository = eVDetailRepository;
        _batteryDetailRepository = batteryDetailRepository;
        _userRepository = userRepository;
        _itemImageRepository = itemImageRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _notificationService = notificationService;
        _userContextService = userContextService;
    }

    private DateTime now = DateTime.Now;
    public async Task<IEnumerable<BidderHistoryDto>> GetBidderHistoryAsync(int auctionId)
    {
        var auctionExists = await _auctionRepository.GetByIdAsync(auctionId);
        if (auctionExists == null)
            throw new KeyNotFoundException($"Auction with ID {auctionId} not found.");
        var bids = await _bidRepository.GetBidsByAuctionIdAsync(auctionId);
        if (!bids.Any())
            return Enumerable.Empty<BidderHistoryDto>();
        var userIds = bids.Select(b => b.UserId).Distinct().ToHashSet();
        var users = (await _userRepository.GetAllAsync()).Where(u => userIds.Contains(u.UserId)).ToDictionary(u => u.UserId);

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

    public async Task<AuctionDto?> GetAuctionByItemIdAsync(int itemId)
    {
        var auction = await _auctionRepository.GetByItemIdAsync(itemId);
        if (auction == null)
        {
            return null;
        }
        return await MapToAuctionDto(auction);
    }

    public async Task<AuctionListResponse> GetAuctionsAsync(int page = 1, int pageSize = 10, string? status = null)
    {
        var (auctions, total) = await _auctionRepository.GetAuctionsWithPaginationAsync(page, pageSize, status);

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
        var auction = await _auctionRepository.GetByIdAsync(auctionId);
        if (auction == null) return null;

        return await MapToAuctionDto(auction);
    }

    public async Task<CreateAuctionResponse> CreateAuctionAsync(CreateAuctionRequest request)
    {
        var existingItem = await _itemRepository.GetByIdAsync(request.ItemId);
        if (existingItem == null)
            throw new KeyNotFoundException($"Item with ID {request.ItemId} not found.");

        // check item has not in auction
        var existingAuction = await _auctionRepository.GetByItemIdAsync(request.ItemId);
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
            Status = DateTime.Now >= request.StartTime ? "ongoing" : "upcoming",
            TotalBids = 0,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        await _auctionRepository.CreateAsync(auction);
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

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);

            if (auction == null || auction.Status != "Ongoing" || now < auction.StartTime || now > auction.EndTime)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Auction is not active or has ended.");
            }
            var currentPrice = auction.CurrentPrice ?? auction.StartingPrice;
            decimal requiredMinimumBid = currentPrice + auction.StepPrice;
            if (bidAmount < requiredMinimumBid)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new ArgumentException($"Bid amount must be at least {requiredMinimumBid:N0} (current price + step price).");
            }

            user = await _userRepository.GetByIdAsync(userId);
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

            var previousUserActiveBid = await _unitOfWork.Bids.GetUserHighestActiveBidAsync(auctionId, userId);

            decimal amountToHoldNow = 0;
            decimal previousHeldAmount = 0;

            if (previousUserActiveBid != null)
            {
                if (bidAmount <= previousUserActiveBid.BidAmount)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw new ArgumentException($"Your new bid must be higher than your current highest bid ({previousUserActiveBid.BidAmount:N0}).");
                }
                previousHeldAmount = previousUserActiveBid.BidAmount;
                amountToHoldNow = bidAmount - previousHeldAmount;
            }
            else
            {
                amountToHoldNow = bidAmount;
            }

            if ((wallet.Balance - wallet.HeldBalance) < amountToHoldNow)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Insufficient available funds (considering held amounts).");
            }

            bool updateWalletSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(wallet.WalletId, -amountToHoldNow, amountToHoldNow);
            if (!updateWalletSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError("Failed to update wallet balance/held amount for Wallet {WalletId}.", wallet.WalletId);
                throw new Exception($"Failed to update wallet balances. WalletId: {wallet.WalletId}");
            }
            _logger.LogInformation("Successfully held {Amount} from Wallet {WalletId} (Held Balance: {HeldBalance})", amountToHoldNow, wallet.WalletId, wallet.HeldBalance + amountToHoldNow);

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

            if (previousUserActiveBid != null)
            {
                await _unitOfWork.Bids.UpdateBidStatusAsync(previousUserActiveBid.BidId, "outbid");
                _logger.LogInformation("Updated previous bid {PreviousBidId} for User {UserId} to 'outbid'.", previousUserActiveBid.BidId, userId);
            }

            previousHighestBid = await _unitOfWork.Bids.GetHighestActiveBidAsync(auctionId, excludeBidId: newBidId);

            if (previousHighestBid != null && previousHighestBid.UserId != userId)
            {
                await _unitOfWork.Bids.UpdateBidStatusAsync(previousHighestBid.BidId, "outbid");
                _logger.LogInformation("User {PreviousHighestUserId}'s bid {PreviousHighestBidId} is now 'outbid'.", previousHighestBid.UserId, previousHighestBid.BidId);
            }

            await _unitOfWork.Auctions.UpdateCurrentPriceAsync(auctionId, bidAmount);
            await _unitOfWork.Auctions.UpdateTotalBidsAsync(auctionId);

            var newBidHistory = new BidderHistoryDto
            {
                UserId = userId,
                FullName = user.FullName ?? "Anonymous Bidder",
                BidAmount = bidAmount,
                BidTime = newBid.BidTime
            };

            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully placed bid {BidId} for User {UserId} in Auction {AuctionId}. Amount: {BidAmount}. Transaction committed.", newBid.BidId, userId, auctionId, bidAmount);

            // notification for user outbid
            if (previousHighestBid != null)
            {
                var outbidMessage = $"You have been outbid on auction #{auctionId}. The new price is {bidAmount:N0}đ.";
                var notiDto = new CreateNotificationDto
                {
                    NotiType = "auction",
                    TargetUserId = previousHighestBid.UserId.ToString(),
                    Title = "You have been outbid!",
                    Message = outbidMessage
                };
                _ = _notificationService.AddNewNotification(notiDto, 0, "");
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
        var upcomingAuctions = await _auctionRepository.GetUpcomingAuctionsAsync();

        foreach (var auction in upcomingAuctions)
        {
            if (auction.StartTime < now && auction.Status == "upcoming")
                await _auctionRepository.UpdateStatusAsync(auction, "ongoing");
        }

        // Update ongoing to ended
        var ongoingAuctions = await _auctionRepository.GetActiveAuctionsAsync();

        foreach (var auction in ongoingAuctions)
        {
            if (auction.EndTime < now)
                await _auctionRepository.UpdateStatusAsync(auction, "ended");
        }
    }

    private async Task<AuctionDto?> MapToAuctionDto(Auction auction)
    {
        var item = await _itemRepository.GetByIdAsync(auction.ItemId);
        if (item == null) return null;
        var image = await _itemImageRepository.GetByItemIdAsync(item.ItemId);

        var auctionDto = new AuctionDto
        {
            AuctionId = auction.AuctionId,
            ItemId = auction.ItemId,
            Title = item.Title,
            Type = item.ItemType ?? "unknown",
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.CurrentPrice,
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
                var evDetail = await _eVDetailRepository.GetByIdAsync(auction.ItemId);
                if (evDetail != null)
                {
                    auctionDto.Title = $"{evDetail.Model} {evDetail.Version}".Trim();
                }
                break;

            case "Battery":
                var batteryDetail = await _batteryDetailRepository.GetByIdAsync(auction.ItemId);
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
        var auction = await _auctionRepository.GetByIdAsync(auctionId);
        if (auction == null)
            throw new KeyNotFoundException("Auction not found."); //404

        string status;

        if (now < auction.StartTime)
            status = "upcoming";
        else if (now >= auction.StartTime && now < auction.EndTime)
            status = "ongoing";
        else
            status = "ended";

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
        var auctions = await _auctionRepository.GetAllAsync(page, pageSize);
        var totalCount = await _auctionRepository.GetTotalCountAsync();

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
        var auctions = await _auctionRepository.GetAuctionsByUserIdAsync(userId);
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