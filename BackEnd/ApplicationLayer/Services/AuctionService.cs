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

    public async Task PlaceBidAsync(int auctionId, int userId, decimal bidAmount)
    {
        // Use transactions to ensure all steps succeed or fail together
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var auction = await _auctionRepository.GetByIdAsync(auctionId);

            // Validate auction status and time
            if (auction == null || auction.Status != "ongoing" || DateTime.Now < auction.StartTime || DateTime.Now > auction.EndTime)
            {
                await _unitOfWork.RollbackTransactionAsync(); // Rollback before throw
                throw new InvalidOperationException("Auction is not active or has ended."); // 400 Bad Request
            }

            // Get the current price safely, consider the starting price as the current price if no one has placed a bid yet
            var currentPrice = auction.CurrentPrice ?? auction.StartingPrice;

            //verify step price
            decimal requiredMinimumBid = currentPrice + auction.StepPrice;
            if (bidAmount < requiredMinimumBid)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new ArgumentException($"Bid amount must be at least {requiredMinimumBid:N0} (current price + step price)."); // 400 Bad Request
            }

            Bid? previousHighestBid = null;
            if (auction.TotalBids > 0)
            {
                previousHighestBid = await _bidRepository.GetHighestBidAsync(auctionId);

                if (previousHighestBid != null && previousHighestBid.UserId == userId)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw new InvalidOperationException("You are already the highest bidder.");
                }
            }

            var wallet = await _walletRepository.GetWalletByUserIdAsync(userId);
            if (wallet == null)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException($"User wallet for user ID {userId} not found.");
            }
            if (wallet.Balance < bidAmount)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Insufficient funds."); 
            }

            // hold fee
            bool deductSuccess = await _walletRepository.UpdateBalanceAsync(wallet.WalletId, -bidAmount);
            if (!deductSuccess)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError("Failed to deduct balance for Wallet {WalletId} during bid placement.", wallet.WalletId);
                throw new Exception($"Failed to update wallet balance for hold operation. WalletId: {wallet.WalletId}");
            }
            _logger.LogInformation("Successfully held {Amount} from Wallet {WalletId} for User {UserId}", bidAmount, wallet.WalletId, userId);


            // create bid
            var newBid = new Bid()
            {
                AuctionId = auctionId,
                UserId = userId,
                BidAmount = bidAmount,
                BidTime = DateTime.Now
            };
            // save bid
            int newBidId = await _bidRepository.PlaceBidAsync(newBid);
            if (newBidId <= 0)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError("Failed to save new bid to database for Auction {AuctionId}.", auctionId);
                throw new Exception("Failed to save bid information."); 
            }
            newBid.BidId = newBidId; // Reassign the newly created BidId to create hold transaction

            //hold transaction
            var holdTransaction = new WalletTransaction()
            {
                WalletId = wallet.WalletId,
                Amount = -bidAmount,
                Type = "hold",
                CreatedAt = DateTime.Now,
                RefId = newBid.BidId // assign bidId reference here
            };
            await _walletTransactionRepository.CreateTransactionAsync(holdTransaction);
            _logger.LogInformation("Created 'hold' transaction {TransactionId} for Bid {BidId}", holdTransaction.TransactionId, newBid.BidId);

            // Update the current price and total bids of the auction
             auction.CurrentPrice = bidAmount;
            await _auctionRepository.UpdateTotalBidsAsync(auctionId); 
            var auctionToUpdate = await _auctionRepository.GetByIdAsync(auctionId); // Get back auction to update
            if (auctionToUpdate != null)
            {
                auctionToUpdate.CurrentPrice = bidAmount;
            }


            // handle Outbid
            if (previousHighestBid != null && previousHighestBid.UserId != userId)
            {
                _logger.LogInformation("User {PreviousUserId} was outbid by User {CurrentUserId} in Auction {AuctionId}. Publishing event.", previousHighestBid.UserId, userId, auctionId);
                var outbidEvent = new OutbidEventDto
                {
                    AuctionId = auctionId,
                    OutbidUserId = previousHighestBid.UserId,
                    AmountToRelease = previousHighestBid.BidAmount,
                    OriginalBidId = previousHighestBid.BidId // Important to find the right hold to release    
                };
                _messagePublisher.PublishOutbidEvent(outbidEvent); // Send event to RabbitMQ
            }

            await _unitOfWork.CommitTransactionAsync();
            _logger.LogInformation("Successfully placed bid {BidId} for User {UserId} in Auction {AuctionId}. Transaction committed.", newBid.BidId, userId, auctionId);

        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation during PlaceBidAsync for Auction {AuctionId}, User {UserId}.", auctionId, userId);
            throw; 
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Argument error during PlaceBidAsync for Auction {AuctionId}, User {UserId}.", auctionId, userId);
            throw; 
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "System error during PlaceBidAsync for Auction {AuctionId}, User {UserId}. Rolling back transaction.", auctionId, userId);
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception("An error occurred while placing the bid. Please try again later.", ex);
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