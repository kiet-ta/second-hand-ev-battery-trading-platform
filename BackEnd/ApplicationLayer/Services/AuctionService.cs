using Application.DTOs;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services;

public class AuctionService : IAuctionService
{
    private IItemBiddingRepository _itemBiddingRepository;
    private IBidRepository _bidRepository;
    private IWalletRepository _walletRepository;
    private IWalletTransactionRepository _walletTransactionRepository;

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
        // check item available
        var existingItem = await _auctionRepository.GetItemByIdAsync(request.ItemId);
        if (existingItem == null)
        {
            throw new KeyNotFoundException($"Item with ID {request.ItemId} not found.");
        }
        // check item not already in auction
        var existingAuction = await _auctionRepository.GetByItemIdAsync(request.ItemId);
        if (existingAuction != null)
        {
            throw new InvalidOperationException($"Item {request.ItemId} already has an auction.");
        }
        // check start time before end time
        var auction = new ItemBidding
        {
            ItemId = request.ItemId,
            StartingPrice = request.StartingPrice,
            CurrentPrice = request.StartingPrice,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = "active"
        };
        // Save auction to database
        await _auctionRepository.AddAsync(auction);

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