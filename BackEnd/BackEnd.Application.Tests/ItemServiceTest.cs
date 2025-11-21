//using Application.DTOs.ItemDtos;
//using Application.IRepositories;
//using Application.Services;
//using Domain.Entities;
//using Moq;

//namespace BackEnd.Application.Tests
//{
//    public class ItemServiceTest
//    {
//        private readonly Mock<IItemRepository> _repoMock;
//        private readonly ItemService _itemService;
//        private Item _capturedItem;

//        public ItemServiceTest()
//        {
//            _repoMock = new Mock<IItemRepository>();
//            _capturedItem = null;

//            _repoMock.Setup(repo => repo.AddAsync(It.IsAny<Item>(), It.IsAny<CancellationToken?>()))
//                .Callback<Item, CancellationToken?>((item, ct) =>
//                {
//                    _capturedItem = item;
//                });

//            _repoMock.Setup(repo => repo.Update(It.IsAny<Item>()))
//                .Callback<Item>(item =>
//                {
//                    _capturedItem = item;
//                });

//            _itemService = new ItemService(_repoMock.Object);
//        }

//        //  TC_ITEM_001: "Verify retrieving an item by valid ID"
//        [Fact]
//        public async Task TC_ITEM_001_GetByIdAsync_WithValidId_ShouldReturnItem()
//        {
//            // Arrange
//            var item = new Item { ItemId = 1, Title = "Test Item", Price = 1000 };
//            var images = new List<ItemImage> { new ItemImage { ImageId = 1, ImageUrl = "url.jpg" } };

//            _repoMock.Setup(repo => repo.GetByIdAsync(1, null)).ReturnsAsync(item);
//            _repoMock.Setup(repo => repo.GetByItemIdAsync(1)).ReturnsAsync(images);

//            // Act
//            var result = await _itemService.GetByIdAsync(1);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal("Test Item", result.Title);
//            Assert.Single(result.Images); // Kiểm tra collection có 1 phần tử
//            Assert.Equal("url.jpg", result.Images.First().ImageUrl);
//        }

//        //  TC_ITEM_002: "Verify retrieving an item by non-existent ID"
//        [Fact]
//        public async Task TC_ITEM_002_GetByIdAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
//        {
//            // Arrange
//            _repoMock.Setup(repo => repo.GetByIdAsync(999, null))
//                .ReturnsAsync((Item)null); // Repo trả null

//            // Act
//            Func<Task> act = () => _itemService.GetByIdAsync(999); // Service throw

//            // Assert
//            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(act);
//            Assert.Equal("Item with ID 999 not found.", exception.Message);
//        }

//        //  TC_ITEM_003: "Verify retrieving all items"
//        [Fact]
//        public async Task TC_ITEM_003_GetAllAsync_ShouldReturnAllItems()
//        {
//            // Arrange
//            var items = new List<Item>
//            {
//                new Item { ItemId = 1, Title = "Item 1" },
//                new Item { ItemId = 2, Title = "Item 2" }
//            };
//            _repoMock.Setup(repo => repo.GetAllAsync()).ReturnsAsync(items);
//            _repoMock.Setup(repo => repo.GetByItemIdAsync(1)).ReturnsAsync(new List<ItemImage>());
//            _repoMock.Setup(repo => repo.GetByItemIdAsync(2)).ReturnsAsync(new List<ItemImage>());

//            // Act
//            var result = await _itemService.GetAllAsync();

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(2, result.Count());
//            Assert.Equal("Item 1", result.First().Title);
//        }

//        //  TC_ITEM_004: "Verify creating a new item"
//        [Fact]
//        public async Task TC_ITEM_004_CreateAsync_ShouldAddItemToRepository()
//        {
//            // Arrange
//            var itemDto = new ItemDto
//            {
//                ItemType = "EV",
//                Title = "New Item",
//                Price = 1500,
//                Images = new List<ItemImageDto> { new ItemImageDto { ImageUrl = "new.jpg" } }
//            };

//            // Act
//            var result = await _itemService.CreateAsync(itemDto);

//            // Assert
//            _repoMock.Verify(repo => repo.AddAsync(It.IsAny<Item>(), null), Times.Once);
//            _repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Exactly(2));
//            _repoMock.Verify(repo => repo.AddImageAsync(It.Is<ItemImage>(img =>
//                img.ImageUrl == "new.jpg"
//            )), Times.Once);

//            Assert.NotNull(_capturedItem);
//            Assert.Equal("New Item", _capturedItem.Title);
//            Assert.Equal("pending", _capturedItem.Status);
//            Assert.False(_capturedItem.IsDeleted);
//        }

//        //  TC_ITEM_005: "Verify updating an item with a valid ID"
//        [Fact]
//        public async Task TC_ITEM_005_UpdateAsync_WithValidId_ShouldUpdateItem()
//        {
//            // Arrange
//            var existingItem = new Item { ItemId = 1, Title = "Old Title" };
//            _repoMock.Setup(repo => repo.GetByIdAsync(1, null)).ReturnsAsync(existingItem);

//            var updatedDto = new ItemDto
//            {
//                Title = "Updated Title",
//                Price = 1200,
//                Status = "active",
//                Moderation = "Approved"
//            };

//            // Act
//            var result = await _itemService.UpdateAsync(1, updatedDto);

//            // Assert
//            Assert.True(result);
//            _repoMock.Verify(repo => repo.Update(It.IsAny<Item>()), Times.Once);
//            _repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);

//            Assert.NotNull(_capturedItem);
//            Assert.Equal("Updated Title", _capturedItem.Title);
//            Assert.Equal(1200, _capturedItem.Price);
//            Assert.Equal("active", _capturedItem.Status);
//            Assert.Equal("Approved", _capturedItem.Moderation);
//        }

//        //  TC_ITEM_006: "Verify updating an item with a non-existent ID"
//        [Fact]
//        public async Task TC_ITEM_006_UpdateAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
//        {
//            // Arrange
//            _repoMock.Setup(repo => repo.GetByIdAsync(999, null))
//                .ReturnsAsync((Item)null);

//            var updatedDto = new ItemDto { Title = "Updated Title" };

//            // Act
//            Func<Task> act = () => _itemService.UpdateAsync(999, updatedDto); // Service throw

//            // Assert
//            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(act);
//            Assert.Equal("Item with ID 999 not found.", exception.Message);
//        }

//        //  TC_ITEM_007: "Verify deleting an item with a valid ID"
//        [Fact]
//        public async Task TC_ITEM_007_DeleteAsync_WithValidId_ShouldDeleteItem()
//        {
//            // Arrange
//            var existingItem = new Item { ItemId = 1 };
//            _repoMock.Setup(repo => repo.GetByIdAsync(1, null)).ReturnsAsync(existingItem);

//            // Act
//            var result = await _itemService.DeleteAsync(1);

//            // Assert
//            Assert.True(result);
//            _repoMock.Verify(repo => repo.Delete(existingItem), Times.Once);
//            _repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
//        }

//        //  TC_ITEM_008: "Verify deleting an item with a non-existent ID"
//        [Fact]
//        public async Task TC_ITEM_008_DeleteAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
//        {
//            // Arrange
//            _repoMock.Setup(repo => repo.GetByIdAsync(999, null))
//                .ReturnsAsync((Item)null);
//            // Act
//            Func<Task> act = () => _itemService.DeleteAsync(999); // Service throw

//            // Assert
//            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(act);
//            Assert.Equal("Item with ID 999 not found.", exception.Message);
//        }

//        //  TC_ITEM_009: "Verify retrieving the latest EVs"
//        [Fact]
//        public async Task TC_ITEM_009_GetLatestEVsAsync_ShouldReturnLatestEVs()
//        {
//            // Arrange
//            var evItems = new List<Item> { new Item { ItemId = 1, ItemType = "EV", Title = "EV 1" } };
//            _repoMock.Setup(repo => repo.GetLatestEVsAsync(5)).ReturnsAsync(evItems);
//            _repoMock.Setup(repo => repo.GetByItemIdAsync(1)).ReturnsAsync(new List<ItemImage>());

//            // Act
//            var result = await _itemService.GetLatestEVsAsync(5);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Single(result);
//            Assert.Equal("EV", result.First().ItemType);
//        }

//        //  TC_ITEM_010: "Verify retrieving the latest Batteries"
//        [Fact]
//        public async Task TC_ITEM_010_GetLatestBatteriesAsync_ShouldReturnLatestBatteries()
//        {
//            // Arrange
//            var batteryItems = new List<Item> { new Item { ItemId = 3, ItemType = "Battery", Title = "Battery 1" } };
//            _repoMock.Setup(repo => repo.GetLatestBatteriesAsync(5)).ReturnsAsync(batteryItems);
//            _repoMock.Setup(repo => repo.GetByItemIdAsync(3)).ReturnsAsync(new List<ItemImage>());

//            // Act
//            var result = await _itemService.GetLatestBatteriesAsync(5);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Single(result);
//            Assert.Equal("Battery", result.First().ItemType);
//        }

//        //  TC_ITEM_011 -> TC_ITEM_017: "Verify searching items..."
//        [Fact]
//        public async Task TC_ITEM_011_to_017_SearchItemsAsync_ShouldCallRepository_WithCorrectParameters()
//        {
//            // Arrange
//            var expectedResult = new PagedResultItem<ItemDto>
//            {
//                Items = new List<ItemDto> { new ItemDto { ItemId = 1, Title = "Tesla" } },
//                TotalCount = 1,
//                Page = 1,
//                PageSize = 10
//            };

//            _repoMock.Setup(repo => repo.SearchItemsAsync(
//                "ev",       // itemType (TC_ITEM_011)
//                "Tesla",    // title (TC_ITEM_012)
//                1000,       // minPrice (TC_ITEM_013)
//                5000,       // maxPrice (TC_ITEM_013)
//                1,          // page (TC_ITEM_014)
//                10,         // pageSize (TC_ITEM_014)
//                "Price",    // sortBy (TC_ITEM_015)
//                "asc"       // sortDir (TC_ITEM_015)
//            )).ReturnsAsync(expectedResult);

//            // Act
//            var result = await _itemService.SearchItemsAsync(
//                "ev", "Tesla", 1000, 5000, 1, 10, "Price", "asc");

//            // Assert
//            _repoMock.Verify(repo => repo.SearchItemsAsync(
//                "ev", "Tesla", 1000, 5000, 1, 10, "Price", "asc"
//            ), Times.Once);

//            Assert.Equal(expectedResult, result);
//            Assert.Equal(1, result.TotalCount);
//            Assert.Equal("Tesla", result.Items.First().Title);
//        }

//        //  TC_ITEM_018: "Verify retrieving an item with details by valid ID"
//        [Fact]
//        public async Task TC_ITEM_018_GetItemWithDetailsAsync_WithValidId_ShouldReturnItemWithDetails()
//        {
//            // Arrange
//            var itemDetail = new ItemWithDetailDto { ItemId = 1, Title = "Test Item" };
//            _repoMock.Setup(repo => repo.GetItemWithDetailsAsync(1)).ReturnsAsync(itemDetail);

//            // Act
//            var result = await _itemService.GetItemWithDetailsAsync(1);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(1, result.ItemId);
//        }

//        //  TC_ITEM_019: "Verify retrieving an item with details by non-existent ID"
//        [Fact]
//        public async Task TC_ITEM_019_GetItemWithDetailsAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
//        {
//            // Arrange
//            _repoMock.Setup(repo => repo.GetItemWithDetailsAsync(999))
//                .ReturnsAsync((ItemWithDetailDto)null);

//            // Act
//            Func<Task> act = () => _itemService.GetItemWithDetailsAsync(999); // Service throw

//            // Assert
//            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(act);
//            Assert.Equal("Item with ID 999 not found.", exception.Message);
//        }

//        //  TC_ITEM_020: "Verify retrieving all items with details"
//        [Fact]
//        public async Task TC_ITEM_020_GetAllItemsWithDetailsAsync_ShouldReturnAllItemsWithDetails()
//        {
//            // Arrange
//            var items = new List<ItemWithDetailDto> { new ItemWithDetailDto { ItemId = 1 } };
//            _repoMock.Setup(repo => repo.GetAllItemsWithDetailsAsync()).ReturnsAsync(items);

//            // Act
//            var result = await _itemService.GetAllItemsWithDetailsAsync();

//            // Assert
//            Assert.NotNull(result);
//            Assert.Single(result);
//        }

//        //  TC_ITEM_021: "Verify creating an item with null values"
//        [Fact]
//        public async Task TC_ITEM_021_CreateAsync_WithNullValues_ShouldSetDefaultValues()
//        {
//            // Arrange
//            var itemDto = new ItemDto
//            {
//                Title = "Test Item",
//                ItemType = null
//            };

//            // Act
//            var result = await _itemService.CreateAsync(itemDto);

//            // Assert
//            _repoMock.Verify(repo => repo.AddAsync(It.IsAny<Item>(), null), Times.Once);

//            Assert.NotNull(_capturedItem);
//            Assert.Equal("Test Item", _capturedItem.Title);
//            Assert.Null(_capturedItem.ItemType);
//            Assert.Equal("pending", _capturedItem.Status); // Default status
//            Assert.False(_capturedItem.IsDeleted); // Default IsDeleted
//        }
//    }
//}