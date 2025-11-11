//using Application.DTOs;
//using Application.IRepositories;
//using Application.Services;
//using Domain.Entities;
//using Moq;

//namespace BackEnd.Application.Tests
//{
//    public class HistoryServiceTests
//    {
//        private readonly Mock<IHistorySoldRepository> _repoMock;
//        private readonly HistorySoldService _service;
//        private readonly User _fakeSeller;
//        private readonly int _sellerId = 1;

//        public HistoryServiceTests()
//        {
//            _repoMock = new Mock<IHistorySoldRepository>();
//            _service = new HistorySoldService(_repoMock.Object);

//            // Arrange: Create a re-usable fake seller for tests
//            _fakeSeller = new User { UserId = _sellerId, FullName = "Test Seller" };

//            // Default setup: Assume seller exists for most tests
//            _repoMock.Setup(r => r.GetSellerByIdAsync(_sellerId))
//                .ReturnsAsync(_fakeSeller);
//        }

//        // Helper function to create fake item lists
//        private List<Item> FakeItems(string type, int count)
//        {
//            return Enumerable.Range(1, count)
//                .Select(i => new Item { ItemId = i, UpdatedBy = _sellerId, ItemType = type })
//                .ToList();
//        }

//        // Helper function to create mixed item lists
//        private List<Item> FakeMixedItems(int batteryCount, int evCount)
//        {
//            var items = Enumerable.Range(1, batteryCount)
//                .Select(i => new Item { ItemId = i, UpdatedBy = _sellerId, ItemType = "battery" })
//                .ToList();

//            items.AddRange(Enumerable.Range(batteryCount + 1, evCount)
//                .Select(i => new Item { ItemId = i, UpdatedBy = _sellerId, ItemType = "ev" }));

//            return items;
//        }

//        // ### Tests for GetSoldItemsAsync ###

//        [Fact]
//        public async Task GetSoldItemsAsync_ShouldThrowKeyNotFoundException_WhenSellerNotFound()
//        {
//            // Arrange
//            // Override default setup: Make seller return null
//            _repoMock.Setup(r => r.GetSellerByIdAsync(_sellerId)).ReturnsAsync((User)null);

//            // Act & Assert
//            // Verify that the service throws KeyNotFoundException as expected
//            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetSoldItemsAsync(_sellerId));
//        }

//        [Fact]
//        public async Task GetSoldItemsAsync_ShouldReturnEmptyList_WhenNoItemsFound()
//        {
//            // Arrange
//            // Mock the repo to return an empty list of items
//            _repoMock.Setup(r => r.GetSoldItemsAsync(_sellerId)).ReturnsAsync(new List<Item>());

//            // Act
//            var result = await _service.GetSoldItemsAsync(_sellerId);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Empty(result);
//        }

//        [Fact]
//        public async Task GetSoldItemsAsync_ShouldReturnMappedBatteryItems_WithSoldStatus()
//        {
//            // Arrange
//            var items = FakeItems("battery", 2);
//            var mappedItems = new List<BatteryItemDto>
//            {
//                new BatteryItemDto { ItemId = 1 },
//                new BatteryItemDto { ItemId = 2 }
//            };

//            _repoMock.Setup(r => r.GetSoldItemsAsync(_sellerId)).ReturnsAsync(items);
//            _repoMock.Setup(r => r.MapToBatteryItemsAsync(items)).ReturnsAsync(mappedItems);

//            // Act
//            var result = await _service.GetSoldItemsAsync(_sellerId);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(2, result.Count);
//            // Verify that the service correctly set the 'Status' property
//            Assert.All(result, item => Assert.Equal("sold", ((BatteryItemDto)item).Status));
//        }

//        [Fact]
//        public async Task GetSoldItemsAsync_ShouldReturnMappedEVItems_WithSoldStatus()
//        {
//            // Arrange
//            var items = FakeItems("ev", 1);
//            var mappedItems = new List<EVItemDto> { new EVItemDto { ItemId = 1 } };

//            _repoMock.Setup(r => r.GetSoldItemsAsync(_sellerId)).ReturnsAsync(items);
//            _repoMock.Setup(r => r.MapToEVItemsAsync(items)).ReturnsAsync(mappedItems);

//            // Act
//            var result = await _service.GetSoldItemsAsync(_sellerId);

//            // Assert
//            Assert.Single(result);
//            Assert.Equal("sold", ((EVItemDto)result.First()).Status);
//        }

//        [Fact]
//        public async Task GetSoldItemsAsync_ShouldHandleMixedEVAndBatteryItems()
//        {
//            // Arrange
//            var items = FakeMixedItems(batteryCount: 1, evCount: 1); // 1 battery, 1 ev
//            var batteryItems = items.Where(i => i.ItemType == "battery").ToList();
//            var evItems = items.Where(i => i.ItemType == "ev").ToList();

//            _repoMock.Setup(r => r.GetSoldItemsAsync(_sellerId)).ReturnsAsync(items);

//            // Mock the specific mappings
//            _repoMock.Setup(r => r.MapToBatteryItemsAsync(batteryItems))
//                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });
//            _repoMock.Setup(r => r.MapToEVItemsAsync(evItems))
//                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });

//            // Act
//            var result = await _service.GetSoldItemsAsync(_sellerId);

//            // Assert
//            Assert.Equal(2, result.Count);
//            Assert.Contains(result, item => item is BatteryItemDto);
//            Assert.Contains(result, item => item is EVItemDto);
//        }

//        // ### Tests for GetPendingPaymentItemsAsync ###

//        [Fact]
//        public async Task GetPendingPaymentItemsAsync_ShouldThrowKeyNotFoundException_WhenSellerNotFound()
//        {
//            // Arrange
//            _repoMock.Setup(r => r.GetSellerByIdAsync(_sellerId)).ReturnsAsync((User)null);

//            // Act & Assert
//            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetPendingPaymentItemsAsync(_sellerId));
//        }

//        [Fact]
//        public async Task GetPendingPaymentItemsAsync_ShouldReturnMappedItems_WithPendingStatus()
//        {
//            // Arrange
//            var items = FakeItems("ev", 1); // Test with EV items
//            var mappedItems = new List<EVItemDto> { new EVItemDto { ItemId = 1 } };

//            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(_sellerId)).ReturnsAsync(items);
//            _repoMock.Setup(r => r.MapToEVItemsAsync(items)).ReturnsAsync(mappedItems);

//            // Act
//            var result = await _service.GetPendingPaymentItemsAsync(_sellerId);

//            // Assert
//            Assert.Single(result);
//            // Verify that the service correctly set the 'Status' property
//            Assert.Equal("pending_approval", ((EVItemDto)result.First()).Status);
//        }

//        // ### Tests for GetProcessingItemsAsync ###

//        [Fact]
//        public async Task GetProcessingItemsAsync_ShouldThrowKeyNotFoundException_WhenSellerNotFound()
//        {
//            // Arrange
//            _repoMock.Setup(r => r.GetSellerByIdAsync(_sellerId)).ReturnsAsync((User)null);

//            // Act & Assert
//            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetProcessingItemsAsync(_sellerId));
//        }

//        [Fact]
//        public async Task GetProcessingItemsAsync_ShouldReturnMappedItems_WithProcessingStatus()
//        {
//            // Arrange
//            var items = FakeItems("battery", 1); // Test with Battery items
//            var mappedItems = new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } };

//            _repoMock.Setup(r => r.GetProcessingItemsAsync(_sellerId)).ReturnsAsync(items);
//            _repoMock.Setup(r => r.MapToBatteryItemsAsync(items)).ReturnsAsync(mappedItems);

//            // Act
//            var result = await _service.GetProcessingItemsAsync(_sellerId);

//            // Assert
//            Assert.Single(result);
//            // Verify that the service correctly set the 'Status' property
//            Assert.Equal("processing", ((BatteryItemDto)result.First()).Status);
//        }

//        // ### Tests for GetCanceledItemsAsync ###

//        [Fact]
//        public async Task GetCanceledItemsAsync_ShouldThrowKeyNotFoundException_WhenSellerNotFound()
//        {
//            // Arrange
//            _repoMock.Setup(r => r.GetSellerByIdAsync(_sellerId)).ReturnsAsync((User)null);

//            // Act & Assert
//            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetCanceledItemsAsync(_sellerId));
//        }

//        [Fact]
//        public async Task GetCanceledItemsAsync_ShouldReturnMappedItems_WithCanceledStatus()
//        {
//            // Arrange
//            var items = FakeItems("ev", 1);
//            var mappedItems = new List<EVItemDto> { new EVItemDto { ItemId = 1 } };

//            _repoMock.Setup(r => r.GetCanceledItemsAsync(_sellerId)).ReturnsAsync(items);
//            _repoMock.Setup(r => r.MapToEVItemsAsync(items)).ReturnsAsync(mappedItems);

//            // Act
//            var result = await _service.GetCanceledItemsAsync(_sellerId);

//            // Assert
//            Assert.Single(result);
//            // Verify that the service correctly set the 'Status' property
//            Assert.Equal("canceled", ((EVItemDto)result.First()).Status);
//        }

//        // ### Tests for GetAllSellerItemsAsync (The complex one) ###

//        [Fact]
//        public async Task GetAllSellerItemsAsync_ShouldThrowKeyNotFoundException_WhenSellerNotFound()
//        {
//            // Arrange
//            _repoMock.Setup(r => r.GetSellerByIdAsync(_sellerId)).ReturnsAsync((User)null);

//            // Act & Assert
//            // Note: This tests the (int sellerId) overload
//            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetAllSellerItemsAsync(_sellerId));
//        }

//        [Fact]
//        public async Task GetAllSellerItemsAsync_ShouldReturnAllItemTypes_WithCorrectStatuses()
//        {
//            // Arrange
//            // 1. Setup different item lists by status
//            var soldItems = new List<Item> { new Item { ItemId = 1, ItemType = "battery" } };
//            var pendingItems = new List<Item> { new Item { ItemId = 2, ItemType = "ev" } };
//            var processingItems = new List<Item> { new Item { ItemId = 3, ItemType = "battery" } };
//            var canceledItems = new List<Item> { new Item { ItemId = 4, ItemType = "ev" } };
//            // 2. Setup "available" items (items that are NOT in any other list)
//            var allItems = new List<Item>
//            {
//                soldItems[0],       // Item 1
//                pendingItems[0],    // Item 2
//                processingItems[0], // Item 3
//                canceledItems[0],   // Item 4
//                new Item { ItemId = 5, ItemType = "battery" }, // Item 5 (Available)
//                new Item { ItemId = 6, ItemType = "ev" }       // Item 6 (Available)
//            };
//            var availableItems = allItems.Where(i => i.ItemId == 5 || i.ItemId == 6).ToList();

//            // 3. Mock repository calls for each status
//            _repoMock.Setup(r => r.GetSoldItemsAsync(_sellerId)).ReturnsAsync(soldItems);
//            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(_sellerId)).ReturnsAsync(pendingItems);
//            _repoMock.Setup(r => r.GetProcessingItemsAsync(_sellerId)).ReturnsAsync(processingItems);
//            _repoMock.Setup(r => r.GetCanceledItemsAsync(_sellerId)).ReturnsAsync(canceledItems);
//            _repoMock.Setup(r => r.GetAllSellerItemsAsync(_sellerId)).ReturnsAsync(allItems);

//            // 4. Mock mapping functions
//            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.Is<List<Item>>(l => l.Any(i => i.ItemId == 1))))
//                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });
//            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.Is<List<Item>>(l => l.Any(i => i.ItemId == 3))))
//                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 3 } });
//            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.Is<List<Item>>(l => l.Any(i => i.ItemId == 5))))
//                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 5 } });

//            _repoMock.Setup(r => r.MapToEVItemsAsync(It.Is<List<Item>>(l => l.Any(i => i.ItemId == 2))))
//                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });
//            _repoMock.Setup(r => r.MapToEVItemsAsync(It.Is<List<Item>>(l => l.Any(i => i.ItemId == 4))))
//                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 4 } });
//            _repoMock.Setup(r => r.MapToEVItemsAsync(It.Is<List<Item>>(l => l.Any(i => i.ItemId == 6))))
//                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 6 } });

//            // Act
//            var result = await _service.GetAllSellerItemsAsync(_sellerId);

//            // Assert
//            Assert.Equal(6, result.Count); // Should contain all 6 items

//            // Check if statuses were set correctly by the service
//            Assert.Equal("sold", ((BatteryItemDto)result.First(i => ((dynamic)i).ItemId == 1)).Status);
//            Assert.Equal("pending_approval", ((EVItemDto)result.First(i => ((dynamic)i).ItemId == 2)).Status);
//            Assert.Equal("processing", ((BatteryItemDto)result.First(i => ((dynamic)i).ItemId == 3)).Status);
//            Assert.Equal("canceled", ((EVItemDto)result.First(i => ((dynamic)i).ItemId == 4)).Status);
//            Assert.Equal("available", ((BatteryItemDto)result.First(i => ((dynamic)i).ItemId == 5)).Status);
//            Assert.Equal("available", ((EVItemDto)result.First(i => ((dynamic)i).ItemId == 6)).Status);
//        }
//    }
//}