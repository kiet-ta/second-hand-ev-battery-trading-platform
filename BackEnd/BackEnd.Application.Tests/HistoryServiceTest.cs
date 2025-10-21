
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Application.DTOs;
using Moq;


namespace BackEnd.Application.Tests
{



    public class HistorySoldServiceTests
    {
        private readonly Mock<IHistorySoldRepository> _repoMock;
        private readonly HistorySoldService _service;

        public HistorySoldServiceTests()
        {
            _repoMock = new Mock<IHistorySoldRepository>();
            _service = new HistorySoldService(_repoMock.Object);
        }

        private User FakeSeller => new User { UserId = 1, FullName = "Seller1" };
        private List<Item> FakeItems(string type, int count)
            => Enumerable.Range(1, count).Select(i => new Item { ItemId = i, UpdatedBy = 1, ItemType = type }).ToList();

        [Fact]
        public async Task GetSoldItemsAsync_ShouldThrow_WhenSellerNotFound()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync((User)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetSoldItemsAsync(1));
        }

        [Fact]
        public async Task GetSoldItemsAsync_ShouldReturnEmpty_WhenNoItems()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(new List<Item>());

            var result = await _service.GetSoldItemsAsync(1);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetSoldItemsAsync_ShouldReturnMappedBatteryItems()
        {
            var items = FakeItems("battery", 2);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(items)).ReturnsAsync(
                new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetSoldItemsAsync(1);
            Assert.Single(result);
            Assert.Equal("sold", ((BatteryItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetSoldItemsAsync_ShouldReturnMappedEVItems()
        {
            var items = FakeItems("ev", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToEVItemsAsync(items)).ReturnsAsync(
                new List<EVItemDto> { new EVItemDto { ItemId = 5 } });

            var result = await _service.GetSoldItemsAsync(1);
            Assert.Single(result);
            Assert.Equal("sold", ((EVItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetSoldItemsAsync_ShouldHandleMixedItems()
        {
            var items = FakeItems("battery", 1).Concat(FakeItems("ev", 1)).ToList();
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });
            _repoMock.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });

            var result = await _service.GetSoldItemsAsync(1);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldThrow_WhenSellerNotFound()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync((User)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetPendingPaymentItemsAsync(1));
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldReturnEmpty_WhenNone()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(new List<Item>());

            var result = await _service.GetPendingPaymentItemsAsync(1);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldReturnBatteryStatus()
        {
            var items = FakeItems("battery", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(items))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetPendingPaymentItemsAsync(1);
            Assert.Equal("pending_approval", ((BatteryItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldReturnEVStatus()
        {
            var items = FakeItems("ev", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToEVItemsAsync(items))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 5 } });

            var result = await _service.GetPendingPaymentItemsAsync(1);
            Assert.Equal("pending_approval", ((EVItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetPendingPaymentItemsAsync_ShouldHandleBothTypes()
        {
            var items = FakeItems("battery", 1).Concat(FakeItems("ev", 1)).ToList();
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });
            _repoMock.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });

            var result = await _service.GetPendingPaymentItemsAsync(1);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldThrow_WhenSellerMissing()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync((User)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetProcessingItemsAsync(1));
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldReturnEmpty_WhenNoData()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(new List<Item>());

            var result = await _service.GetProcessingItemsAsync(1);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldMapBatteryItems()
        {
            var items = FakeItems("battery", 2);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(items))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetProcessingItemsAsync(1);
            Assert.Equal("processing", ((BatteryItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldMapEVItems()
        {
            var items = FakeItems("ev", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToEVItemsAsync(items))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 99 } });

            var result = await _service.GetProcessingItemsAsync(1);
            Assert.Equal("processing", ((EVItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetProcessingItemsAsync_ShouldCombineEVAndBattery()
        {
            var items = FakeItems("ev", 1).Concat(FakeItems("battery", 1)).ToList();
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });
            _repoMock.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });

            var result = await _service.GetProcessingItemsAsync(1);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldThrow_WhenSellerNull()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync((User)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetCanceledItemsAsync(1));
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldReturnEmpty_WhenNoItems()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(new List<Item>());
            var result = await _service.GetCanceledItemsAsync(1);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldMapBatteryItems()
        {
            var items = FakeItems("battery", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(items))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 3 } });

            var result = await _service.GetCanceledItemsAsync(1);
            Assert.Equal("canceled", ((BatteryItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldMapEVItems()
        {
            var items = FakeItems("ev", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToEVItemsAsync(items))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 10 } });

            var result = await _service.GetCanceledItemsAsync(1);
            Assert.Equal("canceled", ((EVItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetCanceledItemsAsync_ShouldHandleMixedTypes()
        {
            var items = FakeItems("ev", 1).Concat(FakeItems("battery", 1)).ToList();
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(items);
            _repoMock.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 1 } });
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 2 } });

            var result = await _service.GetCanceledItemsAsync(1);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldReturnEmpty_WhenSellerNotFound()
        {
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync((User)null);
            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldIncludeAvailableItems()
        {
            var all = FakeItems("battery", 2);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(all))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Contains(result, r => ((BatteryItemDto)r).Status == "available");
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldCombineAllStatuses()
        {
            var sold = FakeItems("battery", 1);
            var all = FakeItems("battery", 2);

            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(sold);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.NotEmpty(result);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldExcludeTakenIds()
        {
            var sold = new List<Item> { new Item { ItemId = 1, ItemType = "battery" } };
            var all = new List<Item> { new Item { ItemId = 1, ItemType = "battery" }, new Item { ItemId = 2, ItemType = "battery" } };
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(sold);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 2 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.DoesNotContain(result, r => (r as BatteryItemDto)?.ItemId == 1);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldSetAvailableStatusForBattery()
        {
            var all = FakeItems("battery", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(all))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Equal("available", ((BatteryItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldSetAvailableStatusForEV()
        {
            var all = FakeItems("ev", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.MapToEVItemsAsync(all))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 1 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Equal("available", ((EVItemDto)result.First()).Status);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldReturnEmpty_WhenAllItemsTaken()
        {
            var all = FakeItems("battery", 1);
            var sold = FakeItems("battery", 1);
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(sold);

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldHandleMixedEVAndBattery()
        {
            var all = FakeItems("battery", 1).Concat(FakeItems("ev", 1)).ToList();
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.GetSoldItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetPendingPaymentItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetProcessingItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.GetCanceledItemsAsync(1)).ReturnsAsync(new List<Item>());
            _repoMock.Setup(r => r.MapToEVItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<EVItemDto> { new EVItemDto { ItemId = 2 } });
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetAllSellerItemsAsync_ShouldReturnDistinctItems()
        {
            var all = new List<Item> {
                new Item { ItemId = 1, ItemType = "battery" },
                new Item { ItemId = 1, ItemType = "battery" }
            };
            _repoMock.Setup(r => r.GetSellerByIdAsync(1)).ReturnsAsync(FakeSeller);
            _repoMock.Setup(r => r.GetAllSellerItemsAsync(1)).ReturnsAsync(all);
            _repoMock.Setup(r => r.MapToBatteryItemsAsync(It.IsAny<List<Item>>()))
                     .ReturnsAsync(new List<BatteryItemDto> { new BatteryItemDto { ItemId = 1 } });

            var result = await _service.GetAllSellerItemsAsync(1);
            Assert.Single(result);
        }
    }
}


