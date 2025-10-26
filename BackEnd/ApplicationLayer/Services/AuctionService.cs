using Application.DTOs.AuctionDtos;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using AutoMapper.Configuration.Annotations;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
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
        IMessagePublisher messagePublisher)
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
            CurrentPrice = request.StartingPrice,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = DateTime.Now >= request.StartTime ? "ongoing" : "upcoming"
        };

        await _auctionRepository.CreateAsync(auction);

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

    public async Task PlaceBidAsync(int auctionId, int userId, decimal bidAmount)
    {
        var auction = await _auctionRepository.GetByIdAsync(auctionId);

        // Validate auction status and time
        if (auction == null || auction.Status != "ongoing" || DateTime.Now > auction.EndTime)
        {
            //throw 400
            throw new InvalidOperationException("Auction is not active or has ended.");
        }

        var currentPrice = auction.CurrentPrice;
        if (bidAmount <= currentPrice)
        {
            //throw 400
            throw new ArgumentException("Bid amount must be higher than the current price.");
        }

        Bid? previousHighestBid = null;
        if (auction.TotalBids > 0)
        {
            previousHighestBid = await _bidRepository.GetHighestBidAsync(auctionId);

            if (previousHighestBid != null && previousHighestBid.UserId == userId)
            {
                throw new InvalidOperationException("You are already the highest bidder.");
            }
        }

        var wallet = await _walletRepository.GetWalletByUserIdAsync(userId);
        if (wallet == null || wallet.Balance < bidAmount)
        {
            //throw 400
            throw new InvalidOperationException("User wallet not found or insufficient funds.");
        }

        var newBid = new Bid()
        {
            AuctionId = auctionId,
            UserId = userId,
            BidAmount = bidAmount,
            BidTime = DateTime.Now
        };

        var holdTransaction = new WalletTransaction()
        {
            WalletId = wallet.WalletId,
            Amount = -bidAmount,
            Type = "hold",
            CreatedAt = DateTime.Now,
            RefId = newBid.BidId
        };

        // update current price and total bids
        await _bidRepository.PlaceBidAsync(newBid);
        auction.CurrentPrice = bidAmount;
        await _auctionRepository.UpdateCurrentPriceAsync(auction);
        await _auctionRepository.UpdateTotalBidsAsync(auctionId);

        if (previousHighestBid != null && previousHighestBid.UserId != userId)
        {
            var outbidEvent = new OutbidEventDto
            {
                AuctionId = auctionId,
                OutbidUserId = previousHighestBid.UserId,
                AmountToRelease = previousHighestBid.BidAmount,
                OriginalBidId = previousHighestBid.BidId // !help find the hold transaction correctly
            };
            _messagePublisher.PublishOutbidEvent(outbidEvent);
        }
    }

    public async Task UpdateAuctionStatusesAsync()
    {
        var now = DateTime.Now;

        // Update upcoming to ongoing
        var upcomingAuctions = await _auctionRepository.GetUpcomingAuctionsAsync();

        foreach (var auction in upcomingAuctions)
        {
            if (auction.StartTime < now)
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
            a.Status = now < a.StartTime ? "UPCOMING" :
                       now >= a.StartTime && now < a.EndTime ? "ONGOING" : "ENDED";
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