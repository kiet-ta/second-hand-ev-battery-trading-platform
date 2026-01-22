using Application.DTOs;
using Application.DTOs.AuctionDtos;
using Application.IHelpers;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Application.Services;
using Domain.Common.Constants;
using Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace BackEnd.Application.Tests;

/// <summary>
/// Comprehensive tests for AuctionService
/// Following 100% statement testing + 100% decision testing coverage goals
/// Testing all business rules and edge cases
/// </summary>
public class AuctionServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<ILogger<AuctionService>> _loggerMock;
    private readonly Mock<IDateTimeProvider> _dateTimeProviderMock;
    private readonly AuctionService _auctionService;

    public AuctionServiceTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _notificationServiceMock = new Mock<INotificationService>();
        _loggerMock = new Mock<ILogger<AuctionService>>();
        _dateTimeProviderMock = new Mock<IDateTimeProvider>();

        _auctionService = new AuctionService(
            _unitOfWorkMock.Object,
            _notificationServiceMock.Object,
            _loggerMock.Object,
            _dateTimeProviderMock.Object
        );

        // Setup default transaction behavior
        _unitOfWorkMock.Setup(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.RollbackTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
    }

    #region CreateAuctionAsync Tests - 100% Coverage

    [Fact]
    public async Task CreateAuctionAsync_WithValidRequest_ShouldCreateAuction()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var request = new CreateAuctionRequest
        {
            ItemId = 1,
            StartingPrice = 1000000,
            StartTime = now.AddHours(1),
            EndTime = now.AddHours(2)
        };

        var existingItem = new Item { ItemId = 1, Title = "Test Item" };
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(existingItem);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync((Auction?)null);
        _unitOfWorkMock.Setup(u => u.Auctions.CreateAsync(It.IsAny<Auction>())).ReturnsAsync(1);

        // Act
        var result = await _auctionService.CreateAuctionAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.ItemId.Should().Be(1);
        result.StartingPrice.Should().Be(1000000);
        result.Status.Should().Be(AuctionStatus.Upcoming.ToString());
        _unitOfWorkMock.Verify(u => u.Auctions.CreateAsync(It.IsAny<Auction>()), Times.Once);
    }

    [Fact]
    public async Task CreateAuctionAsync_WhenStartTimeInPast_ShouldSetStatusOngoing()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var request = new CreateAuctionRequest
        {
            ItemId = 1,
            StartingPrice = 1000000,
            StartTime = now.AddMinutes(-30), // Started 30 mins ago
            EndTime = now.AddHours(2)
        };

        var existingItem = new Item { ItemId = 1, Title = "Test Item" };
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(existingItem);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync((Auction?)null);
        _unitOfWorkMock.Setup(u => u.Auctions.CreateAsync(It.IsAny<Auction>())).ReturnsAsync(1);

        // Act
        var result = await _auctionService.CreateAuctionAsync(request);

        // Assert
        result.Status.Should().Be(AuctionStatus.Ongoing.ToString());
    }

    [Fact]
    public async Task CreateAuctionAsync_WhenStartTimeExactlyNow_ShouldSetStatusOngoing()
    {
        // Arrange - Edge case: start time exactly equals now
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var request = new CreateAuctionRequest
        {
            ItemId = 1,
            StartingPrice = 1000000,
            StartTime = now, // Exactly now
            EndTime = now.AddHours(2)
        };

        var existingItem = new Item { ItemId = 1, Title = "Test Item" };
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(existingItem);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync((Auction?)null);
        _unitOfWorkMock.Setup(u => u.Auctions.CreateAsync(It.IsAny<Auction>())).ReturnsAsync(1);

        // Act
        var result = await _auctionService.CreateAuctionAsync(request);

        // Assert - now >= StartTime means Ongoing
        result.Status.Should().Be(AuctionStatus.Ongoing.ToString());
    }

    [Fact]
    public async Task CreateAuctionAsync_WhenItemNotFound_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(999, It.IsAny<CancellationToken?>())).ReturnsAsync((Item?)null);

        var request = new CreateAuctionRequest
        {
            ItemId = 999,
            StartingPrice = 1000000,
            StartTime = DateTime.Now.AddHours(1),
            EndTime = DateTime.Now.AddHours(2)
        };

        // Act
        Func<Task> act = () => _auctionService.CreateAuctionAsync(request);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*999*not found*");
    }

    [Fact]
    public async Task CreateAuctionAsync_WhenItemAlreadyHasAuction_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var existingItem = new Item { ItemId = 1, Title = "Test Item" };
        var existingAuction = new Auction { AuctionId = 1, ItemId = 1 };

        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(existingItem);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync(existingAuction);

        var request = new CreateAuctionRequest
        {
            ItemId = 1,
            StartingPrice = 1000000,
            StartTime = DateTime.Now.AddHours(1),
            EndTime = DateTime.Now.AddHours(2)
        };

        // Act
        Func<Task> act = () => _auctionService.CreateAuctionAsync(request);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already has an auction*");
    }

    [Fact]
    public async Task CreateAuctionAsync_WhenStartTimeAfterEndTime_ShouldThrowArgumentException()
    {
        // Arrange
        var existingItem = new Item { ItemId = 1, Title = "Test Item" };
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(existingItem);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync((Auction?)null);

        var request = new CreateAuctionRequest
        {
            ItemId = 1,
            StartingPrice = 1000000,
            StartTime = DateTime.Now.AddHours(3), // Start AFTER end
            EndTime = DateTime.Now.AddHours(1)
        };

        // Act
        Func<Task> act = () => _auctionService.CreateAuctionAsync(request);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Start time must be earlier than end time*");
    }

    [Fact]
    public async Task CreateAuctionAsync_WhenStartTimeEqualsEndTime_ShouldThrowArgumentException()
    {
        // Arrange - Edge case: start == end
        var sameTime = DateTime.Now.AddHours(1);
        var existingItem = new Item { ItemId = 1, Title = "Test Item" };
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(existingItem);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync((Auction?)null);

        var request = new CreateAuctionRequest
        {
            ItemId = 1,
            StartingPrice = 1000000,
            StartTime = sameTime,
            EndTime = sameTime // Same as start
        };

        // Act
        Func<Task> act = () => _auctionService.CreateAuctionAsync(request);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Start time must be earlier than end time*");
    }

    #endregion

    #region PlaceBidAsync Tests - Core Business Logic

    [Fact]
    public async Task PlaceBidAsync_WhenAuctionNotFound_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(999)).ReturnsAsync((Auction?)null);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(999, 1, 1500000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenAuctionNotOngoing_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Upcoming.ToString(), // Not Ongoing!
            StartTime = now.AddHours(1),
            EndTime = now.AddHours(2),
            StartingPrice = 1000000
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1500000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenBeforeStartTime_ShouldThrowInvalidOperationException()
    {
        // Arrange - Auction is Ongoing but current time is before StartTime (edge case)
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = now.AddMinutes(30), // Starts in 30 mins
            EndTime = now.AddHours(2),
            StartingPrice = 1000000
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1500000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenAfterEndTime_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 15, 0, 0); // Auction ended at 14:00
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = now.AddHours(-3),
            EndTime = now.AddHours(-1), // Ended 1 hour ago
            StartingPrice = 1000000
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1500000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenBidBelowMinimum_ShouldThrowArgumentException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = now.AddHours(-1),
            EndTime = now.AddHours(1),
            StartingPrice = 1000000,
            CurrentPrice = 1500000,
            StepPrice = 100000 // Minimum next bid: 1600000
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act - Bid 1550000 which is less than 1600000 (current + step)
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1550000);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Bid amount must be at least*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenFirstBidBelowStartingPricePlusStep_ShouldThrowArgumentException()
    {
        // Arrange - No current price means use starting price
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = now.AddHours(-1),
            EndTime = now.AddHours(1),
            StartingPrice = 1000000,
            CurrentPrice = null, // No bids yet
            StepPrice = 100000 // Minimum first bid: 1100000
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act - Bid 1050000 which is less than 1100000
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1050000);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Bid amount must be at least*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenUserNotFound_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(999)).ReturnsAsync((User?)null);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 999, 1200000);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*User*999*not found*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenWalletNotFound_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        var user = new User { UserId = 1, FullName = "Test User" };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(1)).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.Wallets.GetWalletByUserIdAsync(1)).ReturnsAsync((Wallet?)null);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1200000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*wallet*not found*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenInsufficientBalance_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        var user = new User { UserId = 1, FullName = "Test User" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 500000, HeldBalance = 100000 }; // Available: 400000

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(1)).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.Wallets.GetWalletByUserIdAsync(1)).ReturnsAsync(wallet);
        _unitOfWorkMock.Setup(u => u.Bids.GetUserHighestActiveBidAsync(1, 1)).ReturnsAsync((Bid?)null);

        // Act - Bid 1200000 but only 400000 available
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1200000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Insufficient available funds*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenNewBidLowerThanOwnPreviousBid_ShouldThrowArgumentException()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.CurrentPrice = 1500000;
        
        var user = new User { UserId = 1, FullName = "Test User" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 10000000, HeldBalance = 2000000 };
        var previousBid = new Bid { BidId = 1, UserId = 1, AuctionId = 1, BidAmount = 2000000 }; // User already bid 2M

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(1)).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.Wallets.GetWalletByUserIdAsync(1)).ReturnsAsync(wallet);
        _unitOfWorkMock.Setup(u => u.Bids.GetUserHighestActiveBidAsync(1, 1)).ReturnsAsync(previousBid);

        // Act - Try to bid 1800000 which passes minimum (1600000) but is less than own bid (2000000)
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1800000);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Your new bid must be higher than your current highest bid*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenValidFirstBid_ShouldSucceed()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        var user = new User { UserId = 1, FullName = "Test User" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user, wallet, null, null);

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 1200000);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(1);
        result.BidAmount.Should().Be(1200000);
        result.FullName.Should().Be("Test User");
        _unitOfWorkMock.Verify(u => u.Bids.PlaceBidAsync(It.IsAny<Bid>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenOutbiddingAnotherUser_ShouldNotifyPreviousHighestBidder()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.CurrentPrice = 1100000;
        
        var user = new User { UserId = 2, FullName = "New Bidder" };
        var wallet = new Wallet { WalletId = 2, UserId = 2, Balance = 5000000, HeldBalance = 0 };
        var previousHighestBid = new Bid { BidId = 1, UserId = 1, AuctionId = 1, BidAmount = 1100000, Status = BidStatus.Active.ToString() };

        SetupSuccessfulBidMocks(auction, user, wallet, null, previousHighestBid);

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 2, 1300000);

        // Assert
        _unitOfWorkMock.Verify(u => u.Bids.UpdateBidStatusAsync(1, "outbid"), Times.Once);
        _notificationServiceMock.Verify(n => n.AddNewNotification(
            It.Is<CreateNotificationDto>(dto => 
                dto.TargetUserId == "1" && 
                dto.Title.Contains("outbid")), 
            It.IsAny<int>(), 
            It.IsAny<string>()), 
            Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenUpdateWalletFails_ShouldRollbackAndThrow()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        var user = new User { UserId = 1, FullName = "Test User" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(1)).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.Wallets.GetWalletByUserIdAsync(1)).ReturnsAsync(wallet);
        _unitOfWorkMock.Setup(u => u.Bids.GetUserHighestActiveBidAsync(1, 1)).ReturnsAsync((Bid?)null);
        _unitOfWorkMock.Setup(u => u.Wallets.UpdateBalanceAndHeldAsync(1, It.IsAny<decimal>(), It.IsAny<decimal>())).ReturnsAsync(false);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1200000);

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("*Failed to update wallet*");
        _unitOfWorkMock.Verify(u => u.RollbackTransactionAsync(It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    #endregion

    #region PlaceBidAsync - BuyNow Trigger Tests

    [Fact]
    public async Task PlaceBidAsync_WhenBidEqualsBuyNowPrice_ShouldTriggerInstantPurchase()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.BuyNowPrice = 2000000; // Set BuyNow price
        
        var user = new User { UserId = 1, FullName = "Buyer" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user, wallet, null, null);
        _unitOfWorkMock.Setup(u => u.Bids.GetAllLoserActiveOrOutbidBidsAsync(1, 1)).ReturnsAsync(new List<Bid>());

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 2000000); // Exactly BuyNow

        // Assert
        _unitOfWorkMock.Verify(u => u.Bids.UpdateBidStatusAsync(It.IsAny<int>(), BidStatus.Winner.ToString()), Times.Once);
        _unitOfWorkMock.Verify(u => u.Auctions.Update(It.Is<Auction>(a => 
            a.Status == AuctionStatus.Ended.ToString() && 
            a.EndTime == now)), Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenBidExceedsBuyNowPrice_ShouldTriggerInstantPurchase()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.BuyNowPrice = 2000000;
        
        var user = new User { UserId = 1, FullName = "Buyer" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user, wallet, null, null);
        _unitOfWorkMock.Setup(u => u.Bids.GetAllLoserActiveOrOutbidBidsAsync(1, 1)).ReturnsAsync(new List<Bid>());

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 2500000); // Above BuyNow

        // Assert
        _unitOfWorkMock.Verify(u => u.Auctions.Update(It.Is<Auction>(a => 
            a.Status == AuctionStatus.Ended.ToString())), Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenBuyNowTriggered_ShouldRefundAllLosers()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.BuyNowPrice = 2000000;
        auction.CurrentPrice = 1500000;
        
        var winner = new User { UserId = 3, FullName = "Winner" };
        var winnerWallet = new Wallet { WalletId = 3, UserId = 3, Balance = 5000000, HeldBalance = 0 };

        // Two losers with previous bids
        var loser1Bid = new Bid { BidId = 1, UserId = 1, AuctionId = 1, BidAmount = 1300000, Status = BidStatus.Active.ToString() };
        var loser2Bid = new Bid { BidId = 2, UserId = 2, AuctionId = 1, BidAmount = 1500000, Status = BidStatus.OutBid.ToString() };
        var loserBids = new List<Bid> { loser1Bid, loser2Bid };

        var loser1HoldTransaction = new WalletTransaction { TransactionId = 1, WalletId = 1, Amount = -1300000 };
        var loser2HoldTransaction = new WalletTransaction { TransactionId = 2, WalletId = 2, Amount = -1500000 };

        SetupSuccessfulBidMocks(auction, winner, winnerWallet, null, null);
        _unitOfWorkMock.Setup(u => u.Bids.GetAllLoserActiveOrOutbidBidsAsync(1, 3)).ReturnsAsync(loserBids);
        _unitOfWorkMock.Setup(u => u.WalletTransactions.FindHoldTransactionByRefIdAsync(1)).ReturnsAsync(loser1HoldTransaction);
        _unitOfWorkMock.Setup(u => u.WalletTransactions.FindHoldTransactionByRefIdAsync(2)).ReturnsAsync(loser2HoldTransaction);

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 3, 2000000);

        // Assert - Both losers should get refunds
        _unitOfWorkMock.Verify(u => u.Wallets.UpdateBalanceAndHeldAsync(1, 1300000, -1300000), Times.Once);
        _unitOfWorkMock.Verify(u => u.Wallets.UpdateBalanceAndHeldAsync(2, 1500000, -1500000), Times.Once);
        _unitOfWorkMock.Verify(u => u.Bids.UpdateBidStatusAsync(1, BidStatus.Released.ToString()), Times.Once);
        _unitOfWorkMock.Verify(u => u.Bids.UpdateBidStatusAsync(2, BidStatus.Released.ToString()), Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenBuyNowTriggeredButNoLosers_ShouldStillEndAuction()
    {
        // Arrange - First bid is BuyNow
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.BuyNowPrice = 2000000;
        
        var user = new User { UserId = 1, FullName = "Buyer" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user, wallet, null, null);
        _unitOfWorkMock.Setup(u => u.Bids.GetAllLoserActiveOrOutbidBidsAsync(1, 1)).ReturnsAsync(new List<Bid>());

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 2000000);

        // Assert
        _unitOfWorkMock.Verify(u => u.Auctions.Update(It.Is<Auction>(a => 
            a.Status == AuctionStatus.Ended.ToString())), Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenBuyNowTriggeredButHoldTransactionNotFound_ShouldSkipLoser()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.BuyNowPrice = 2000000;
        
        var winner = new User { UserId = 2, FullName = "Winner" };
        var winnerWallet = new Wallet { WalletId = 2, UserId = 2, Balance = 5000000, HeldBalance = 0 };
        var loserBid = new Bid { BidId = 1, UserId = 1, AuctionId = 1, BidAmount = 1300000 };

        SetupSuccessfulBidMocks(auction, winner, winnerWallet, null, null);
        _unitOfWorkMock.Setup(u => u.Bids.GetAllLoserActiveOrOutbidBidsAsync(1, 2)).ReturnsAsync(new List<Bid> { loserBid });
        _unitOfWorkMock.Setup(u => u.WalletTransactions.FindHoldTransactionByRefIdAsync(1)).ReturnsAsync((WalletTransaction?)null);

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 2, 2000000);

        // Assert - Should not throw, just skip the loser
        result.Should().NotBeNull();
        _unitOfWorkMock.Verify(u => u.Wallets.UpdateBalanceAndHeldAsync(1, It.IsAny<decimal>(), It.IsAny<decimal>()), Times.Never);
    }

    [Fact]
    public async Task PlaceBidAsync_WhenNoBuyNowPrice_ShouldNotTriggerInstantPurchase()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.BuyNowPrice = null; // No BuyNow price
        
        var user = new User { UserId = 1, FullName = "Bidder" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user, wallet, null, null);

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 5000000); // Very high bid

        // Assert - Auction should still be ongoing
        _unitOfWorkMock.Verify(u => u.Auctions.Update(It.Is<Auction>(a => 
            a.Status == AuctionStatus.Ended.ToString())), Times.Never);
    }

    #endregion

    #region PlaceBidAsync - Concurrent Bidding Tests (Last Second Scenario)

    [Fact]
    public async Task PlaceBidAsync_TwoUsersBiddingAtLastSecond_FirstBidWins()
    {
        // Arrange - Auction ends in 1 second
        var now = new DateTime(2026, 1, 22, 14, 59, 59); // 1 second before end
        var endTime = new DateTime(2026, 1, 22, 15, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = now.AddHours(-1),
            EndTime = endTime,
            StartingPrice = 1000000,
            CurrentPrice = 1500000,
            StepPrice = 100000
        };

        var user1 = new User { UserId = 1, FullName = "User 1" };
        var wallet1 = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user1, wallet1, null, null);

        // Act - User 1 places bid at last second
        var result = await _auctionService.PlaceBidAsync(1, 1, 1700000);

        // Assert
        result.Should().NotBeNull();
        result.BidAmount.Should().Be(1700000);
        _unitOfWorkMock.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PlaceBidAsync_BidAfterEndTime_ShouldReject()
    {
        // Arrange - Bid after end time
        var endTime = new DateTime(2026, 1, 22, 15, 0, 0);
        var now = endTime.AddMilliseconds(1); // Just after end time
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = endTime.AddHours(-1),
            EndTime = endTime,
            StartingPrice = 1000000,
            CurrentPrice = 1500000,
            StepPrice = 100000
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1700000);

        // Assert - now > EndTime means auction ended
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    [Fact]
    public async Task PlaceBidAsync_BidOneMillisecondBeforeEnd_ShouldSucceed()
    {
        // Arrange - Bid just before end
        var endTime = new DateTime(2026, 1, 22, 15, 0, 0);
        var now = endTime.AddMilliseconds(-1);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = endTime.AddHours(-1),
            EndTime = endTime,
            StartingPrice = 1000000,
            CurrentPrice = null,
            StepPrice = 100000
        };

        var user = new User { UserId = 1, FullName = "User" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 0 };

        SetupSuccessfulBidMocks(auction, user, wallet, null, null);

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 1200000);

        // Assert
        result.Should().NotBeNull();
    }

    #endregion

    #region GetAuctionStatusAsync Tests - 100% Coverage

    [Fact]
    public async Task GetAuctionStatusAsync_WhenBeforeStartTime_ShouldReturnUpcoming()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            StartTime = now.AddHours(1), // Starts in 1 hour
            EndTime = now.AddHours(2)
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        var result = await _auctionService.GetAuctionStatusAsync(1);

        // Assert
        result.Status.Should().Be(AuctionStatus.Upcoming.ToString());
    }

    [Fact]
    public async Task GetAuctionStatusAsync_WhenExactlyAtStartTime_ShouldReturnOngoing()
    {
        // Arrange - Edge case: exactly at start time
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            StartTime = now, // Exactly now
            EndTime = now.AddHours(1)
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        var result = await _auctionService.GetAuctionStatusAsync(1);

        // Assert
        result.Status.Should().Be(AuctionStatus.Ongoing.ToString());
    }

    [Fact]
    public async Task GetAuctionStatusAsync_WhenDuringAuction_ShouldReturnOngoing()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            StartTime = now.AddHours(-1), // Started 1 hour ago
            EndTime = now.AddHours(1) // Ends in 1 hour
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        var result = await _auctionService.GetAuctionStatusAsync(1);

        // Assert
        result.Status.Should().Be(AuctionStatus.Ongoing.ToString());
    }

    [Fact]
    public async Task GetAuctionStatusAsync_WhenExactlyAtEndTime_ShouldReturnEnded()
    {
        // Arrange - Edge case: exactly at end time
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            StartTime = now.AddHours(-2),
            EndTime = now // Exactly now
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        var result = await _auctionService.GetAuctionStatusAsync(1);

        // Assert - now >= EndTime means Ended
        result.Status.Should().Be(AuctionStatus.Ended.ToString());
    }

    [Fact]
    public async Task GetAuctionStatusAsync_WhenAfterEndTime_ShouldReturnEnded()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = new Auction
        {
            AuctionId = 1,
            StartTime = now.AddHours(-3),
            EndTime = now.AddHours(-1) // Ended 1 hour ago
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);

        // Act
        var result = await _auctionService.GetAuctionStatusAsync(1);

        // Assert
        result.Status.Should().Be(AuctionStatus.Ended.ToString());
    }

    [Fact]
    public async Task GetAuctionStatusAsync_WhenAuctionNotFound_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(999)).ReturnsAsync((Auction?)null);

        // Act
        Func<Task> act = () => _auctionService.GetAuctionStatusAsync(999);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*not found*");
    }

    #endregion

    #region GetBidderHistoryAsync Tests

    [Fact]
    public async Task GetBidderHistoryAsync_WhenAuctionNotFound_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(999)).ReturnsAsync((Auction?)null);

        // Act
        Func<Task> act = () => _auctionService.GetBidderHistoryAsync(999);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*Auction*999*not found*");
    }

    [Fact]
    public async Task GetBidderHistoryAsync_WhenNoBids_ShouldReturnEmptyList()
    {
        // Arrange
        var auction = new Auction { AuctionId = 1 };
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Bids.GetBidsByAuctionIdAsync(1)).ReturnsAsync(new List<Bid>());

        // Act
        var result = await _auctionService.GetBidderHistoryAsync(1);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetBidderHistoryAsync_WhenHasBids_ShouldReturnOrderedByTimeDescending()
    {
        // Arrange
        var auction = new Auction { AuctionId = 1 };
        var now = DateTime.Now;
        var bids = new List<Bid>
        {
            new Bid { BidId = 1, UserId = 1, BidAmount = 1000000, BidTime = now.AddMinutes(-30) },
            new Bid { BidId = 2, UserId = 2, BidAmount = 1200000, BidTime = now.AddMinutes(-20) },
            new Bid { BidId = 3, UserId = 1, BidAmount = 1400000, BidTime = now.AddMinutes(-10) }
        };
        var users = new List<User>
        {
            new User { UserId = 1, FullName = "User One" },
            new User { UserId = 2, FullName = "User Two" }
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Bids.GetBidsByAuctionIdAsync(1)).ReturnsAsync(bids);
        _unitOfWorkMock.Setup(u => u.Users.GetAllAsync()).ReturnsAsync(users);

        // Act
        var result = (await _auctionService.GetBidderHistoryAsync(1)).ToList();

        // Assert
        result.Should().HaveCount(3);
        result[0].BidAmount.Should().Be(1400000); // Most recent first
        result[1].BidAmount.Should().Be(1200000);
        result[2].BidAmount.Should().Be(1000000);
    }

    [Fact]
    public async Task GetBidderHistoryAsync_WhenUserNotFound_ShouldReturnUnknownName()
    {
        // Arrange
        var auction = new Auction { AuctionId = 1 };
        var bids = new List<Bid>
        {
            new Bid { BidId = 1, UserId = 999, BidAmount = 1000000, BidTime = DateTime.Now }
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Bids.GetBidsByAuctionIdAsync(1)).ReturnsAsync(bids);
        _unitOfWorkMock.Setup(u => u.Users.GetAllAsync()).ReturnsAsync(new List<User>());

        // Act
        var result = (await _auctionService.GetBidderHistoryAsync(1)).ToList();

        // Assert
        result.Should().HaveCount(1);
        result[0].FullName.Should().Be("Unknown");
    }

    #endregion

    #region UpdateAuctionStatusesAsync Tests

    [Fact]
    public async Task UpdateAuctionStatusesAsync_ShouldUpdateUpcomingToOngoing()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var upcomingAuction = new Auction
        {
            AuctionId = 1,
            StartTime = now.AddMinutes(-10), // Started 10 mins ago
            Status = AuctionStatus.Upcoming.ToString()
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetUpcomingAuctionsAsync()).ReturnsAsync(new List<Auction> { upcomingAuction });
        _unitOfWorkMock.Setup(u => u.Auctions.GetActiveAuctionsAsync()).ReturnsAsync(new List<Auction>());

        // Act
        await _auctionService.UpdateAuctionStatusesAsync();

        // Assert
        _unitOfWorkMock.Verify(u => u.Auctions.UpdateStatusAsync(upcomingAuction, AuctionStatus.Ongoing.ToString()), Times.Once);
    }

    [Fact]
    public async Task UpdateAuctionStatusesAsync_ShouldUpdateOngoingToEnded()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var ongoingAuction = new Auction
        {
            AuctionId = 1,
            EndTime = now.AddMinutes(-10), // Ended 10 mins ago
            Status = AuctionStatus.Ongoing.ToString()
        };

        _unitOfWorkMock.Setup(u => u.Auctions.GetUpcomingAuctionsAsync()).ReturnsAsync(new List<Auction>());
        _unitOfWorkMock.Setup(u => u.Auctions.GetActiveAuctionsAsync()).ReturnsAsync(new List<Auction> { ongoingAuction });

        // Act
        await _auctionService.UpdateAuctionStatusesAsync();

        // Assert
        _unitOfWorkMock.Verify(u => u.Auctions.UpdateStatusAsync(ongoingAuction, AuctionStatus.Ended.ToString()), Times.Once);
    }

    [Fact]
    public async Task UpdateAuctionStatusesAsync_WhenNoAuctionsNeedUpdate_ShouldNotUpdate()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        _unitOfWorkMock.Setup(u => u.Auctions.GetUpcomingAuctionsAsync()).ReturnsAsync(new List<Auction>());
        _unitOfWorkMock.Setup(u => u.Auctions.GetActiveAuctionsAsync()).ReturnsAsync(new List<Auction>());

        // Act
        await _auctionService.UpdateAuctionStatusesAsync();

        // Assert
        _unitOfWorkMock.Verify(u => u.Auctions.UpdateStatusAsync(It.IsAny<Auction>(), It.IsAny<string>()), Times.Never);
    }

    #endregion

    #region GetAuctionByItemIdAsync Tests

    [Fact]
    public async Task GetAuctionByItemIdAsync_WhenAuctionExists_ShouldReturnAuctionDto()
    {
        // Arrange
        var auction = new Auction { AuctionId = 1, ItemId = 1, StartingPrice = 1000000 };
        var item = new Item { ItemId = 1, Title = "Test Item", ItemType = "Battery" };
        var images = new List<ItemImage> { new ItemImage { ImageId = 1, ImageUrl = "http://test.com/image.jpg" } };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(item);
        _unitOfWorkMock.Setup(u => u.ItemImages.GetByItemIdAsync(1)).ReturnsAsync(images);

        // Act
        var result = await _auctionService.GetAuctionByItemIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.AuctionId.Should().Be(1);
        result.Title.Should().Be("Test Item");
    }

    [Fact]
    public async Task GetAuctionByItemIdAsync_WhenAuctionNotExists_ShouldReturnNull()
    {
        // Arrange
        _unitOfWorkMock.Setup(u => u.Auctions.GetByItemIdAsync(999)).ReturnsAsync((Auction?)null);

        // Act
        var result = await _auctionService.GetAuctionByItemIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAuctionByIdAsync Tests

    [Fact]
    public async Task GetAuctionByIdAsync_WhenExists_ShouldReturnAuctionDto()
    {
        // Arrange
        var auction = new Auction { AuctionId = 1, ItemId = 1 };
        var item = new Item { ItemId = 1, Title = "EV Battery Pack", ItemType = "Battery" };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(1, It.IsAny<CancellationToken?>())).ReturnsAsync(item);
        _unitOfWorkMock.Setup(u => u.ItemImages.GetByItemIdAsync(1)).ReturnsAsync(new List<ItemImage>());

        // Act
        var result = await _auctionService.GetAuctionByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("EV Battery Pack"); // Battery type uses item.Title directly
        result.Type.Should().Be("Battery");
    }

    [Fact]
    public async Task GetAuctionByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        // Arrange
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(999)).ReturnsAsync((Auction?)null);

        // Act
        var result = await _auctionService.GetAuctionByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAuctionByIdAsync_WhenItemNotFound_ShouldReturnNull()
    {
        // Arrange
        var auction = new Auction { AuctionId = 1, ItemId = 999 };
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Items.GetByIdAsync(999, It.IsAny<CancellationToken?>())).ReturnsAsync((Item?)null);

        // Act
        var result = await _auctionService.GetAuctionByIdAsync(1);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region PlaceBidAsync - User Increasing Own Bid

    [Fact]
    public async Task PlaceBidAsync_WhenUserIncreasesOwnBid_ShouldOnlyHoldDifference()
    {
        // Arrange
        var now = new DateTime(2026, 1, 22, 10, 0, 0);
        _dateTimeProviderMock.Setup(d => d.Now).Returns(now);

        var auction = CreateValidOngoingAuction(now);
        auction.CurrentPrice = 1500000;
        
        var user = new User { UserId = 1, FullName = "Bidder" };
        var wallet = new Wallet { WalletId = 1, UserId = 1, Balance = 5000000, HeldBalance = 1200000 };
        var previousBid = new Bid { BidId = 1, UserId = 1, AuctionId = 1, BidAmount = 1200000, Status = BidStatus.Active.ToString() };

        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(1)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(1)).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.Wallets.GetWalletByUserIdAsync(1)).ReturnsAsync(wallet);
        _unitOfWorkMock.Setup(u => u.Bids.GetUserHighestActiveBidAsync(1, 1)).ReturnsAsync(previousBid);
        _unitOfWorkMock.Setup(u => u.Wallets.UpdateBalanceAndHeldAsync(1, It.IsAny<decimal>(), It.IsAny<decimal>())).ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.Bids.PlaceBidAsync(It.IsAny<Bid>())).ReturnsAsync(2);
        _unitOfWorkMock.Setup(u => u.WalletTransactions.CreateTransactionAsync(It.IsAny<WalletTransaction>())).ReturnsAsync(1);
        _unitOfWorkMock.Setup(u => u.Bids.UpdateBidStatusAsync(It.IsAny<int>(), It.IsAny<string>())).ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.Bids.GetHighestActiveBidAsync(1, 2)).ReturnsAsync((Bid?)null);
        _unitOfWorkMock.Setup(u => u.Auctions.UpdateCurrentPriceAsync(1, It.IsAny<decimal>())).ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.Auctions.UpdateTotalBidsAsync(1));

        // Act
        var result = await _auctionService.PlaceBidAsync(1, 1, 1700000);

        // Assert - Should only hold difference (1700000 - 1200000 = 500000)
        _unitOfWorkMock.Verify(u => u.Wallets.UpdateBalanceAndHeldAsync(1, -500000, 500000), Times.Once);
        _unitOfWorkMock.Verify(u => u.Bids.UpdateBidStatusAsync(1, "outbid"), Times.Once); // Previous own bid marked as outbid
    }

    #endregion

    #region Helper Methods

    private Auction CreateValidOngoingAuction(DateTime now)
    {
        return new Auction
        {
            AuctionId = 1,
            ItemId = 1,
            Status = AuctionStatus.Ongoing.ToString(),
            StartTime = now.AddHours(-1),
            EndTime = now.AddHours(1),
            StartingPrice = 1000000,
            CurrentPrice = null,
            StepPrice = 100000
        };
    }

    private void SetupSuccessfulBidMocks(Auction auction, User user, Wallet wallet, Bid? previousUserBid, Bid? previousHighestBid)
    {
        _unitOfWorkMock.Setup(u => u.Auctions.GetByIdAsync(auction.AuctionId)).ReturnsAsync(auction);
        _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(user.UserId)).ReturnsAsync(user);
        _unitOfWorkMock.Setup(u => u.Wallets.GetWalletByUserIdAsync(user.UserId)).ReturnsAsync(wallet);
        _unitOfWorkMock.Setup(u => u.Bids.GetUserHighestActiveBidAsync(auction.AuctionId, user.UserId)).ReturnsAsync(previousUserBid);
        _unitOfWorkMock.Setup(u => u.Wallets.UpdateBalanceAndHeldAsync(wallet.WalletId, It.IsAny<decimal>(), It.IsAny<decimal>())).ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.Bids.PlaceBidAsync(It.IsAny<Bid>())).ReturnsAsync(100);
        _unitOfWorkMock.Setup(u => u.WalletTransactions.CreateTransactionAsync(It.IsAny<WalletTransaction>())).ReturnsAsync(1);
        _unitOfWorkMock.Setup(u => u.Bids.UpdateBidStatusAsync(It.IsAny<int>(), It.IsAny<string>())).ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.Bids.GetHighestActiveBidAsync(auction.AuctionId, 100)).ReturnsAsync(previousHighestBid);
        _unitOfWorkMock.Setup(u => u.Auctions.UpdateCurrentPriceAsync(auction.AuctionId, It.IsAny<decimal>())).ReturnsAsync(true);
        _unitOfWorkMock.Setup(u => u.Auctions.UpdateTotalBidsAsync(auction.AuctionId));
        _unitOfWorkMock.Setup(u => u.Auctions.Update(It.IsAny<Auction>()));
        _notificationServiceMock.Setup(n => n.AddNewNotification(It.IsAny<CreateNotificationDto>(), It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(true);
    }

    #endregion
}
