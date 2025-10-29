using Application.DTOs.AuctionDtos;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using AutoMapper.Configuration.Annotations;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using static System.Net.Mime.MediaTypeNames;

namespace Application.Services;

public class AuctionService : IAuctionService
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IBidRepository _bidRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;
    private readonly IItemRepository _itemRepository;
    private readonly IItemImageRepository _itemImageRepository;
    private readonly IEVDetailRepository _eVDetailRepository;
    private readonly IBatteryDetailRepository _batteryDetailRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMessagePublisher _messagePublisher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuctionService> _logger;
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
        IMessagePublisher messagePublisher,
        IUnitOfWork unitOfWork,
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
        _messagePublisher = messagePublisher;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

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
            Status = DateTime.UtcNow >= request.StartTime ? "ongoing" : "upcoming",
            TotalBids = 0, 
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow  
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

    // using Application.IRepositories; // Add other necessary usings

    public async Task PlaceBidAsync(int auctionId, int userId, decimal bidAmount)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var auction = await _unitOfWork.Auctions.GetByIdAsync(auctionId);

            // --- Các b??c Validate Auction Status, Time, Min Bid Amount gi? nguyên ---
            if (auction == null || auction.Status != "ongoing" || DateTime.Now < auction.StartTime || DateTime.Now > auction.EndTime)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Auction is not active or has ended."); // 400 Bad Request
            }
            var currentPrice = auction.CurrentPrice ?? auction.StartingPrice;
            decimal requiredMinimumBid = currentPrice + auction.StepPrice;
            if (bidAmount < requiredMinimumBid)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new ArgumentException($"Bid amount must be at least {requiredMinimumBid:N0} (current price + step price)."); // 400 Bad Request
            }
            // --- K?t thúc Validate ---

            // L?y ví và ki?m tra s? d? kh? d?ng
            var wallet = await _unitOfWork.Wallets.GetWalletByUserIdAsync(userId);
            if (wallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"User wallet for user ID {userId} not found.");
            }

            // L?y bid cao nh?t ?ang active c?a user này trong phiên ??u giá này
            var previousUserActiveBid = await _unitOfWork.Bids.GetUserHighestActiveBidAsync(auctionId, userId); // C?n thêm method này vào IBidRepository

            decimal amountToHoldNow = 0;
            decimal previousHeldAmount = 0;

            if (previousUserActiveBid != null)
            {
                // User này ?ang là ng??i gi? giá cao nh?t ho?c ?ã t?ng bid
                if (bidAmount <= previousUserActiveBid.BidAmount)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw new ArgumentException($"Your new bid must be higher than your current highest bid ({previousUserActiveBid.BidAmount:N0}).");
                }
                previousHeldAmount = previousUserActiveBid.BidAmount;
                amountToHoldNow = bidAmount - previousHeldAmount; // Ch? c?n gi? thêm ph?n chênh l?ch
            }
            else
            {
                // L?n ??u user này bid trong phiên này
                amountToHoldNow = bidAmount;
            }

            // Ki?m tra s? d? kh? d?ng (balance - held_balance)
            if ((wallet.Balance - wallet.HeldBalance) < amountToHoldNow)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Insufficient available funds (considering held amounts).");
            }

            // C?p nh?t ví: Gi?m balance, t?ng held_balance
            bool updateWalletSuccess = await _unitOfWork.Wallets.UpdateBalanceAndHeldAsync(wallet.WalletId, -amountToHoldNow, amountToHoldNow); // C?n thêm method này
            if (!updateWalletSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError("Failed to update wallet balance/held amount for Wallet {WalletId}.", wallet.WalletId);
                throw new Exception($"Failed to update wallet balances. WalletId: {wallet.WalletId}");
            }
            _logger.LogInformation("Successfully held {Amount} from Wallet {WalletId} (Held Balance: {HeldBalance})", amountToHoldNow, wallet.WalletId, wallet.HeldBalance + amountToHoldNow);

            // T?o bid m?i v?i status 'active'
            var newBid = new Bid()
            {
                AuctionId = auctionId,
                UserId = userId,
                BidAmount = bidAmount,
                BidTime = DateTime.Now,
                Status = "active" // Tr?ng thái m?i
            };
            int newBidId = await _unitOfWork.Bids.PlaceBidAsync(newBid);
            newBid.BidId = newBidId;

            // T?o transaction 'hold' cho s? ti?n v?a gi? thêm
            var holdTransaction = new WalletTransaction()
            {
                WalletId = wallet.WalletId,
                Amount = -amountToHoldNow, // Ghi nh?n s? ti?n v?a b? tr? kh?i balance
                Type = "hold",
                CreatedAt = DateTime.Now,
                RefId = newBid.BidId, // Liên k?t v?i bid m?i
                AuctionId = auctionId // Liên k?t v?i auction
            };
            await _unitOfWork.WalletTransactions.CreateTransactionAsync(holdTransaction);
            _logger.LogInformation("Created 'hold' transaction {TransactionId} for Bid {BidId} (Amount: {Amount})", holdTransaction.TransactionId, newBid.BidId, amountToHoldNow);

            // C?p nh?t bid c? c?a user này (n?u có) thành 'outbid'
            if (previousUserActiveBid != null)
            {
                await _unitOfWork.Bids.UpdateBidStatusAsync(previousUserActiveBid.BidId, "outbid"); // C?n thêm method này
                _logger.LogInformation("Updated previous bid {PreviousBidId} for User {UserId} to 'outbid'.", previousUserActiveBid.BidId, userId);
                // *** KHÔNG HOÀN TI?N ? ?ÂY ***
            }

            // Tìm ng??i gi? giá cao nh?t TR??C KHI user này ??t giá
            var overallPreviousHighestBid = await _unitOfWork.Bids.GetHighestActiveBidAsync(auctionId, excludeBidId: newBidId); // C?n thêm method này

            // C?p nh?t bid c?a ng??i b? outbid (n?u có và khác user hi?n t?i) thành 'outbid'
            if (overallPreviousHighestBid != null && overallPreviousHighestBid.UserId != userId)
            {
                await _unitOfWork.Bids.UpdateBidStatusAsync(overallPreviousHighestBid.BidId, "outbid");
                _logger.LogInformation("User {PreviousHighestUserId}'s bid {PreviousHighestBidId} is now 'outbid'.", overallPreviousHighestBid.UserId, overallPreviousHighestBid.BidId);
                // *** KHÔNG HOÀN TI?N ? ?ÂY ***
                // *** B? PUBLISH OutbidEventDto ***
            }

            // C?p nh?t giá hi?n t?i c?a auction
            await _unitOfWork.Auctions.UpdateCurrentPriceAsync(auctionId, bidAmount); // C?n s?a/thêm method này
            await _unitOfWork.Auctions.UpdateTotalBidsAsync(auctionId); // Gi? nguyên

            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully placed bid {BidId} for User {UserId} in Auction {AuctionId}. Amount: {BidAmount}. Transaction committed.", newBid.BidId, userId, auctionId, bidAmount);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during PlaceBidAsync for Auction {AuctionId}, User {UserId}. Rolling back transaction.", auctionId, userId);
            await _unitOfWork.RollbackTransactionAsync();
            // Ném l?i l?i ?? Controller ho?c Middleware x? lý
            throw;
        }
    }

    public async Task UpdateAuctionStatusesAsync()
    {
        var now = DateTime.Now;

        // Update upcoming to ongoing
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
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status.ToUpper(),
            Images = image.Select(img => new ItemImageDto
            {
                ImageId = img.ImageId,
                ImageUrl = img.ImageUrl
            }).ToList()
        };

        // Get specific details based on item type
        switch (item.ItemType?.ToLower())
        {
            case "ev":
                var evDetail = await _eVDetailRepository.GetByIdAsync(auction.ItemId);
                if (evDetail != null)
                {
                    auctionDto.Title = $"{evDetail.Model} {evDetail.Version}".Trim();
                }
                break;

            case "battery":
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

        var now = DateTime.Now;
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

        var now = DateTime.UtcNow;

        foreach (var a in auctions)
        {
            a.Status = now < a.StartTime ? "upcoming" :
                       now >= a.StartTime && now < a.EndTime ? "ongoing" : "ended";
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