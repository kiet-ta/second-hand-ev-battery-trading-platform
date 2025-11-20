using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Common.Constants;
using Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class HistorySoldServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IHistorySoldRepository> _mockRepo;
        private readonly HistorySoldService _service;

        public HistorySoldServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockRepo = new Mock<IHistorySoldRepository>();
            _mockUow.Setup(u => u.HistorySolds).Returns(_mockRepo.Object);
            _service = new HistorySoldService(_mockUow.Object);

            _mockRepo.Setup(r => r.GetSellerByIdAsync(It.IsAny<int>()))
                     .ReturnsAsync((int id) => new User { UserId = id, FullName = $"Seller{id}", Role = UserRole.Seller.ToString() });
        }

        private List<Item> MockItems(string type, int count = 2) =>
            Enumerable.Range(1, count).Select(i => new Item { ItemId = i, ItemType = type }).ToList();

        #region Exceptions

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldThrow_WhenSellerIdInvalid()
        {
            await Assert.ThrowsAsync<ArgumentException>(() => _service.GetAllSellerItemsAsync(0));
        }

        [Fact]
        public async Task GetSoldItemsAsync_ShouldThrow_WhenSellerNotFound()
        {
            _mockRepo.Setup(r => r.GetSellerByIdAsync(99)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetSoldItemsAsync(99));
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldThrow_WhenSellerNotFound()
        {
            _mockRepo.Setup(r => r.GetSellerByIdAsync(99)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetPendingPaymentItemsAsync(99));
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldThrow_WhenSellerNotFound()
        {
            _mockRepo.Setup(r => r.GetSellerByIdAsync(99)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetProcessingItemsAsync(99));
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldThrow_WhenSellerNotFound()
        {
            _mockRepo.Setup(r => r.GetSellerByIdAsync(99)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetCanceledItemsAsync(99));
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldThrow_WhenItemsNull()
        {
            _mockRepo.Setup(r => r.GetPendingPaymentItemsAsync(2)).ReturnsAsync((List<Item>?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.GetPendingPaymentItemsAsync(2));
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldThrow_WhenItemsNull()
        {
            _mockRepo.Setup(r => r.GetCanceledItemsAsync(2)).ReturnsAsync((List<Item>?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.GetCanceledItemsAsync(2));
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldThrow_WhenAllItemsNull()
        {
            var id = 5;
            _mockRepo.Setup(r => r.GetAllSellerItemsAsync(id)).ReturnsAsync((List<Item>?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.GetAllSellerItemsAsync(id));
        }

        #endregion

        #region Status Tests

        [Fact]
        public async Task GetSoldItemsAsync_ShouldReturnSoldStatus()
        {
            var items = MockItems(ItemType.Battery.ToString());
            _mockRepo.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(items);
            _mockRepo.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetSoldItemsAsync(1);
            var dto = Assert.IsType<BatteryItemDto>(result.First());
            Assert.Equal("Sold", dto.Status);
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldReturnPendingApprovalStatus()
        {
            var items = MockItems(ItemType.Ev.ToString());
            _mockRepo.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(items);
            _mockRepo.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 1 } });

            var result = await _service.GetPendingPaymentItemsAsync(1);
            var dto = Assert.IsType<EVItemDto>(result.First());
            Assert.Equal("Pending_Approval", dto.Status);
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldReturnProcessingStatus()
        {
            var items = MockItems(ItemType.Battery.ToString());
            _mockRepo.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(items);
            _mockRepo.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetProcessingItemsAsync(1);
            var dto = Assert.IsType<BatteryItemDto>(result.First());
            Assert.Equal("Processing", dto.Status);
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldReturnCanceledStatus()
        {
            var items = MockItems(ItemType.Ev.ToString());
            _mockRepo.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(items);
            _mockRepo.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 1 } });

            var result = await _service.GetCanceledItemsAsync(1);
            var dto = Assert.IsType<EVItemDto>(result.First());
            Assert.Equal("Canceled", dto.Status);
        }

        #endregion

        #region GetAllSellerItemsAsync Tests

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldReturnEmptyList_WhenNoItems()
        {
            var sellerId = 11;
            _mockRepo.Setup(r => r.GetSoldItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetPendingPaymentItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetProcessingItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetCanceledItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetAllSellerItemsAsync(sellerId)).ReturnsAsync(new List<Item>());

            var result = await _service.GetAllSellerItemsAsync(sellerId);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldReturnOnlyAvailable_WhenNoTakenItems()
        {
            var sellerId = 12;
            var allItems = MockItems(ItemType.Battery.ToString(), 3);
            _mockRepo.Setup(r => r.GetSoldItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetPendingPaymentItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetProcessingItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetCanceledItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetAllSellerItemsAsync(sellerId)).ReturnsAsync(allItems);

            _mockRepo.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(allItems.Select(i => new BatteryItemDto { ItemId = i.ItemId }).ToList());

            var result = await _service.GetAllSellerItemsAsync(sellerId);
            Assert.All(result, r => Assert.Equal("Available", ((BatteryItemDto)r).Status));
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldHandleMixedTypes()
        {
            var sellerId = 13;
            var items = new List<Item>
            {
                new Item { ItemId = 1, ItemType = ItemType.Battery.ToString() },
                new Item { ItemId = 2, ItemType = ItemType.Ev.ToString() }
            };

            _mockRepo.Setup(r => r.GetSoldItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetPendingPaymentItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetProcessingItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetCanceledItemsAsync(sellerId)).ReturnsAsync(new List<Item>());
            _mockRepo.Setup(r => r.GetAllSellerItemsAsync(sellerId)).ReturnsAsync(items);

            _mockRepo.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            _mockRepo.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });

            var result = await _service.GetAllSellerItemsAsync(sellerId);
            Assert.Contains(result, r => r is BatteryItemDto);
            Assert.Contains(result, r => r is EVItemDto);
        }

       
        #endregion
    }
}
