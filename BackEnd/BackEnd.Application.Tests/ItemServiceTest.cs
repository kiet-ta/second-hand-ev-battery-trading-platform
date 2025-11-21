using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Application.Services;
using Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class ItemServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IItemRepository> _mockItemRepository;
        private readonly IItemService _itemService;

        public ItemServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockItemRepository = new Mock<IItemRepository>();
            _mockUnitOfWork.Setup(u => u.Items).Returns(_mockItemRepository.Object);
            _itemService = new ItemService(_mockUnitOfWork.Object);
        }



        [Fact(DisplayName = "TC02_GetById_NotFound_ThrowsKeyNotFound")]
        public async Task TC02_GetByIdAsync_ItemNotFound_ThrowsKeyNotFoundException()
        {
            _mockItemRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync((Item?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _itemService.GetByIdAsync(99));
        }

        [Fact(DisplayName = "TC03_GetAll_MultipleItems_ReturnsAllDtos")]
        public async Task TC03_GetAllAsync_MultipleItems_ReturnsAllDtos()
        {
            var items = new List<Item> { new Item { ItemId = 1 }, new Item { ItemId = 2 } };
            _mockItemRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(items);
            _mockItemRepository.Setup(r => r.GetByItemIdAsync(It.IsAny<int>())).ReturnsAsync(new List<ItemImage>());

            var result = await _itemService.GetAllAsync();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }


        [Fact(DisplayName = "TC04_GetAll_NoItems_ThrowsException")]
        public async Task TC04_GetAllAsync_NoItems_ThrowsException()
        {
            _mockItemRepository.Setup(r => r.GetAllAsync()).ReturnsAsync((IEnumerable<Item>?)null);
            var exception = await Assert.ThrowsAsync<Exception>(() => _itemService.GetAllAsync());
            Assert.Equal("No items found.", exception.Message);
        }




        [Fact(DisplayName = "TC09_Update_NotFound_ThrowsKeyNotFound")]
        public async Task TC09_UpdateAsync_ItemNotFound_ThrowsKeyNotFoundException()
        {
            _mockItemRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync((Item?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _itemService.UpdateAsync(99, new ItemDto()));
        }



        [Fact(DisplayName = "TC11_Delete_NotFound_ThrowsKeyNotFound")]
        public async Task TC11_DeleteAsync_ItemNotFound_ThrowsKeyNotFoundException()
        {
            _mockItemRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync((Item?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _itemService.DeleteAsync(99));
        }
        [Fact(DisplayName = "TC12_GetLatestEVs_ReturnsList")]
        public async Task TC12_GetLatestEVsAsync_ReturnsListOfEVs()
        {
            var evs = new List<Item> { new Item { ItemId = 1, ItemType = "EV" } };
            _mockItemRepository.Setup(r => r.GetLatestEVsAsync(5)).ReturnsAsync(evs);
            _mockItemRepository.Setup(r => r.GetByItemIdAsync(It.IsAny<int>())).ReturnsAsync(new List<ItemImage>());

            var result = await _itemService.GetLatestEVsAsync(5);

            Assert.Single(result);
            Assert.All(result, item => Assert.Equal("EV", item.ItemType));
        }

        [Fact(DisplayName = "TC13_GetLatestEVs_NoItems_ThrowsException")]
        public async Task TC13_GetLatestEVsAsync_NoItems_ThrowsException()
        {
            _mockItemRepository.Setup(r => r.GetLatestEVsAsync(It.IsAny<int>())).ReturnsAsync((IEnumerable<Item>?)null);
            var exception = await Assert.ThrowsAsync<Exception>(() => _itemService.GetLatestEVsAsync(5));
            Assert.Equal("No EV items found.", exception.Message);
        }

        [Fact(DisplayName = "TC14_GetLatestBatteries_ReturnsList")]
        public async Task TC14_GetLatestBatteriesAsync_ReturnsListOfBatteries()
        {
            var batteries = new List<Item> { new Item { ItemId = 2, ItemType = "Battery" } };
            _mockItemRepository.Setup(r => r.GetLatestBatteriesAsync(5)).ReturnsAsync(batteries);
            _mockItemRepository.Setup(r => r.GetByItemIdAsync(It.IsAny<int>())).ReturnsAsync(new List<ItemImage>());

            var result = await _itemService.GetLatestBatteriesAsync(5);

            Assert.Single(result);
            Assert.All(result, item => Assert.Equal("Battery", item.ItemType));
        }
        [Fact(DisplayName = "TC15_GetLatestBatteries_NoItems_ThrowsException")]
        public async Task TC15_GetLatestBatteriesAsync_NoItems_ThrowsException()
        {
            _mockItemRepository.Setup(r => r.GetLatestBatteriesAsync(It.IsAny<int>())).ReturnsAsync((IEnumerable<Item>?)null);
            var exception = await Assert.ThrowsAsync<Exception>(() => _itemService.GetLatestBatteriesAsync(5));
            Assert.Equal("No battery items found.", exception.Message);
        }


        [Theory(DisplayName = "TC16_SearchItems_ValidType_CallsRepository")]
        [InlineData("ev")]
        [InlineData("battery")]
        [InlineData("all")]
        public async Task TC16_SearchItemsAsync_ValidItemType_CallsRepository(string itemType)
        {
            _mockItemRepository.Setup(r => r.SearchItemsAsync(itemType, null, null, null, 1, 10, "Title", "asc"))
                .ReturnsAsync(new PagedResultItem<ItemDto>());

            await _itemService.SearchItemsAsync(itemType, null, null, null, 1, 10, "Title", "asc");

            _mockItemRepository.Verify(r => r.SearchItemsAsync(itemType, null, null, null, 1, 10, "Title", "asc"), Times.Once);
        }


        [Fact(DisplayName = "TC17_SearchItems_InvalidType_ThrowsArgumentException")]
        public async Task TC17_SearchItemsAsync_InvalidItemType_ThrowsArgumentException()
        {
            var exception = await Assert.ThrowsAsync<ArgumentException>(() =>
                _itemService.SearchItemsAsync("invalid_type", null, null, null, 1, 10, "Title", "asc"));

            Assert.Contains("Invalid item type", exception.Message);
        }


        [Fact(DisplayName = "TC18_SearchItems_AllParams_CallsRepositoryCorrectly")]
        public async Task TC18_SearchItemsAsync_AllParams_CallsRepositoryCorrectly()
        {
            var expectedResult = new PagedResultItem<ItemDto>();
            _mockItemRepository.Setup(r => r.SearchItemsAsync("ev", "Car", 100M, 200M, 2, 5, "Price", "desc")).ReturnsAsync(expectedResult);

            var result = await _itemService.SearchItemsAsync("ev", "Car", 100M, 200M, 2, 5, "Price", "desc");

            _mockItemRepository.Verify(r => r.SearchItemsAsync("ev", "Car", 100M, 200M, 2, 5, "Price", "desc"), Times.Once);
            Assert.Equal(expectedResult, result);
        }


        [Fact(DisplayName = "TC19_GetItemDetails_Exists_ReturnsDto")]
        public async Task TC19_GetItemWithDetailsAsync_ItemExists_ReturnsDto()
        {
            var itemId = 1;
            var detailDto = new ItemWithDetailDto { ItemId = itemId };
            _mockItemRepository.Setup(r => r.GetItemWithDetailsAsync(itemId)).ReturnsAsync(detailDto);

            var result = await _itemService.GetItemWithDetailsAsync(itemId);

            Assert.NotNull(result);
            Assert.Equal(itemId, result.ItemId);
        }


        [Fact(DisplayName = "TC20_GetItemDetails_NotFound_ThrowsKeyNotFound")]
        public async Task TC20_GetItemWithDetailsAsync_ItemNotFound_ThrowsKeyNotFoundException()
        {
            _mockItemRepository.Setup(r => r.GetItemWithDetailsAsync(It.IsAny<int>())).ReturnsAsync((ItemWithDetailDto?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _itemService.GetItemWithDetailsAsync(99));
        }

        [Fact(DisplayName = "TC21_GetAllItemDetails_ReturnsList")]
        public async Task TC21_GetAllItemsWithDetailsAsync_ReturnsListOfDtos()
        {
            var list = new List<ItemWithDetailDto> { new ItemWithDetailDto(), new ItemWithDetailDto() };
            _mockItemRepository.Setup(r => r.GetAllItemsWithDetailsAsync()).ReturnsAsync(list);

            var result = await _itemService.GetAllItemsWithDetailsAsync();

            Assert.Equal(2, result.Count());
        }

        [Fact(DisplayName = "TC22_GetAllItemDetails_NoItems_ThrowsException")]
        public async Task TC22_GetAllItemsWithDetailsAsync_NoItems_ThrowsException()
        {
            _mockItemRepository.Setup(r => r.GetAllItemsWithDetailsAsync()).ReturnsAsync((IEnumerable<ItemWithDetailDto>?)null);
            var exception = await Assert.ThrowsAsync<Exception>(() => _itemService.GetAllItemsWithDetailsAsync());
            Assert.Equal("No detailed items found.", exception.Message);
        }


    }
}
