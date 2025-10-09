using Application.DTOs;
using Application.DTOs.AuctionDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class AuctionService : IAuctionService
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IBidRepository _bidRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;
    private readonly IItemRepository _itemRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IItemImageRepository _itemImageRepository;
    private readonly IEVDetailRepository _eVDetailRepository;
    private readonly IBatteryDetailRepository _batteryDetailRepository;

    public AuctionService(
        IAuctionRepository auctionRepository,
        IBidRepository bidRepository,
        IWalletRepository walletRepository,
        IWalletTransactionRepository walletTransactionRepository,
        IItemRepository itemRepository,
        IEVDetailRepository eVDetailRepository,
        IBatteryDetailRepository batteryDetailRepository)
    {
        _auctionRepository = auctionRepository;
        _bidRepository = bidRepository;
        _walletRepository = walletRepository;
        _walletTransactionRepository = walletTransactionRepository;
        _itemRepository = itemRepository;
        _eVDetailRepository = eVDetailRepository;
        _batteryDetailRepository = batteryDetailRepository;
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

    public async Task<bool> PlaceBidAsync(int auctionId, int userId, decimal bidAmount)
    {
        var auction = await _auctionRepository.GetByIdAsync(auctionId);

        // Validate auction status and time
        if (auction == null || auction.Status != "ongoing" || DateTime.Now > auction.EndTime)
        {
            return false;
        }

        var currentPrice = auction.CurrentPrice;
        if (bidAmount <= currentPrice)
        {
            return false;
        }

        var wallet = await _walletRepository.GetWalletByUserIdAsync(userId);
        if (wallet == null || wallet.Balance < bidAmount)
        {
            return false;
        }

        // Deduct bid amount from user wallet
        await _walletRepository.UpdateBalanceAsync(wallet.WalletId, -bidAmount);
        await _walletTransactionRepository.CreateTransactionAsync(new WalletTransaction()
        {
            WalletId = wallet.WalletId,
            Amount = -bidAmount,
            Type = "hold",
            CreatedAt = DateTime.Now
        });

        // Record the bid
        await _bidRepository.PlaceBidAsync(new Bid()
        {
            AuctionId = auctionId,
            UserId = userId,
            BidAmount = bidAmount,
            BidTime = DateTime.Now
        });

        // Update current price and total bids
        auction.CurrentPrice = bidAmount;
        await _auctionRepository.UpdateCurrentPriceAsync(auction);
        await _auctionRepository.UpdateTotalBidsAsync(auctionId);

        return true;
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

        Category? category = null;
        if (item.CategoryId.HasValue)
        {
            category = await _categoryRepository.GetCategoryByIdAsync(item.CategoryId.Value);
        }

        ItemImage? image = null;
        if (category != null && category.CategoryId == auction.ItemId)
        {
            image = await _itemImageRepository.GetItemImageById(auction.ItemId);
        }
        var auctionDto = new AuctionDto
        {
            AuctionId = auction.AuctionId,
            ItemId = auction.ItemId,
            Title = item.Title,
            Type = item.ItemType ?? "unknown",
            Category = category?.Name ?? "Unknown",
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.CurrentPrice,
            TotalBids = auction.TotalBids,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status.ToUpper(),
            ImageUrl = image?.ImageUrl
        };

        // Get specific details based on item type
        switch (item.ItemType?.ToLower())
        {
            case "ev":
                var evDetail = await _eVDetailRepository.GetByIdAsync(auction.ItemId);
                if (evDetail != null)
                {
                    auctionDto.Brand = evDetail.Brand ?? "Unknown";
                    auctionDto.Title = $"{evDetail.Model} {evDetail.Version}".Trim();
                }
                break;

            case "battery":
                var batteryDetail = await _batteryDetailRepository.GetByIdAsync(auction.ItemId);
                if (batteryDetail != null)
                {
                    auctionDto.Brand = batteryDetail.Brand ?? "Unknown";
                    auctionDto.Title = $"{item.Title}"; // giữ nguyên tên item
                }
                break;

            default:
                auctionDto.Brand = "Unknown";
                break;
        }

        return auctionDto;
    }

    public async Task<AuctionStatusDto?> GetAuctionStatusAsync(int auctionId)
    {
        var auction = await _auctionRepository.GetByIdAsync(auctionId);
        if (auction == null)
            return null;

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
}