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
    }

    #region CreateAuctionAsync Tests

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

    #endregion

    #region PlaceBidAsync Tests

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
        _unitOfWorkMock.Setup(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.RollbackTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1500000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    [Fact]
    public async Task PlaceBidAsync_WhenAuctionEnded_ShouldThrowInvalidOperationException()
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
        _unitOfWorkMock.Setup(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.RollbackTransactionAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        // Act
        Func<Task> act = () => _auctionService.PlaceBidAsync(1, 1, 1500000);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not active or has ended*");
    }

    #endregion

    #region GetAuctionStatusAsync Tests

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
}
