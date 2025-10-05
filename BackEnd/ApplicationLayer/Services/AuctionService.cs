using Application.DTOs;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services;

public class AuctionService : IAuctionService
{
    private readonly IItemBiddingRepository _itemBiddingRepository;
    private readonly IBidRepository _bidRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IWalletTransactionRepository _walletTransactionRepository;
    private readonly IItemRepository _itemRepository;

    public AuctionService(
        IItemBiddingRepository itemBiddingRepository,
        IBidRepository bidRepository,
        IWalletRepository walletRepository,
        IWalletTransactionRepository walletTransactionRepository
        )
    {
        _itemBiddingRepository = itemBiddingRepository;
        _bidRepository = bidRepository;
        _walletRepository = walletRepository;
        _walletTransactionRepository = walletTransactionRepository;
    }

    // Place a bid on an active auction
    public async Task<bool> PlaceBidAsync(int biddingId, int userId, decimal bidAmount)
    {
        var bidding = await _itemBiddingRepository.GetByIdAsync(biddingId);

        // Validate bidding status and time
        if (bidding == null || bidding.Status != "active" || DateTime.Now > bidding.EndTime)
        {
            return false;
        }
        if (bidAmount <= bidding.CurrentPrice)
        {
            // Bid must be higher than current price
            return false;
        }
        var wallet = await _walletRepository.GetWalletByUserIdAsync(userId);
        // Validate user wallet balance
        if (wallet == null || wallet.Balance < bidAmount)
        {
            return false;
        }
        // Deduct bid amount from user wallet - hold the amount
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
            BiddingId = biddingId,
            UserId = userId,
            BidAmount = bidAmount,
            BidTime = DateTime.Now
        });

        // Update current price in bidding
        await _itemBiddingRepository.UpdateCurrentPriceAsync(bidding);

        return true;
    }

    public async Task<ItemBiddingDto> GetAuctionStatusAsync(int biddingId)

    {
        // Retrieve auction details
        var biddingEntity = await _itemBiddingRepository.GetByIdAsync(biddingId);

        // Handle case where auction is not found
        if (biddingEntity == null)
        {
            throw new KeyNotFoundException($"Auction with ID {biddingId} not found.");
        }

        // Map entity to DTO
        var dto = new ItemBiddingDto
        {
            BiddingId = biddingEntity.BiddingId,
            ItemId = biddingEntity.ItemId,
            StartingPrice = biddingEntity.StartingPrice,
            CurrentPrice = biddingEntity.CurrentPrice,
            StartTime = biddingEntity.StartTime,
            EndTime = biddingEntity.EndTime,
            Status = biddingEntity.Status
        };

        return dto;
    }

    public async Task<CreateAuctionResponse> CreateAuctionAsync(CreateAuctionRequest request)
    {
        // 1. Kiểm tra item tồn tại
        var existingItem = await _itemRepository.GetByIdAsync(request.ItemId);
        if (existingItem == null)
            throw new KeyNotFoundException($"Item with ID {request.ItemId} not found.");

        // 2. Kiểm tra item chưa có auction nào
        var existingAuction = await _itemBiddingRepository.GetByItemIdAsync(request.ItemId);
        if (existingAuction != null)
            throw new InvalidOperationException($"Item {request.ItemId} already has an auction.");

        // 3. Kiểm tra thời gian hợp lệ
        if (request.StartTime >= request.EndTime)
            throw new ArgumentException("Start time must be earlier than end time.");

        // 4. Tạo auction mới
        var auction = new ItemBidding
        {
            ItemId = request.ItemId,
            StartingPrice = request.StartingPrice,
            CurrentPrice = request.StartingPrice,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = "active"
        };

        // 5. Lưu xuống DB
        await _itemBiddingRepository.CreateAsync(auction);

        // 6. Map sang DTO trả về
        return new CreateAuctionResponse
        {
            BiddingId = auction.BiddingId,
            ItemId = auction.ItemId,
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.CurrentPrice,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status
        };
    }
}