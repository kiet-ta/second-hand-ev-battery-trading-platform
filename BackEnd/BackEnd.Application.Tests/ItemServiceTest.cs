using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace BackEnd.Application.Tests
{
    public class ItemServiceTest
    {

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnItem()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var item = new Item
            {
                ItemId = 1,
                ItemType = "EV",
                CategoryId = 1,
                Title = "Test Item",
                Description = "Test Description",
                Price = 1000,
                Quantity = 5
            };

            repoMock.Setup(repo => repo.GetByIdAsync(1, null))
                .ReturnsAsync(item);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("EV", result.ItemType);
            Assert.Equal("Test Item", result.Title);
            Assert.Equal(1000, result.Price);
            Assert.Equal(5, result.Quantity);
        }


        [Fact]
        public async Task GetByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            repoMock.Setup(repo => repo.GetByIdAsync(999, null))
                .ReturnsAsync((Item)null);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }


        [Fact]
        public async Task GetAllAsync_ShouldReturnAllItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var items = new List<Item>
            {
                new Item { ItemId = 1, ItemType = "EV", Title = "Item 1", Price = 1000, Quantity = 5 },
                new Item { ItemId = 2, ItemType = "Battery", Title = "Item 2", Price = 2000, Quantity = 10 }
            };

            repoMock.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetAllAsync();

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal("EV", resultList[0].ItemType);
            Assert.Equal("Battery", resultList[1].ItemType);
            Assert.Equal("Item 1", resultList[0].Title);
            Assert.Equal("Item 2", resultList[1].Title);
        }


        [Fact]
        public async Task CreateAsync_ShouldAddItemToRepository()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var itemService = new ItemService(repoMock.Object);
            
            var itemDto = new ItemDto
            {
                ItemType = "EV",
                CategoryId = 1,
                Title = "New Item",
                Description = "New Description",
                Price = 1500,
                Quantity = 3
            };

            // Act
            var result = await itemService.CreateAsync(itemDto);

            // Assert
            repoMock.Verify(repo => repo.AddAsync(It.IsAny<Item>(), null), Times.Once);
            repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
            Assert.Equal(itemDto.Title, result.Title);
            Assert.Equal(itemDto.Price, result.Price);
        }


        [Fact]
        public async Task UpdateAsync_WithValidId_ShouldUpdateItem()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var existingItem = new Item
            {
                ItemId = 1,
                ItemType = "EV",
                Title = "Old Title",
                Description = "Old Description",
                Price = 1000,
                Quantity = 5
            };

            repoMock.Setup(repo => repo.GetByIdAsync(1, null))
                .ReturnsAsync(existingItem);

            var itemService = new ItemService(repoMock.Object);
            
            var updatedDto = new ItemDto
            {
                ItemType = "EV",
                CategoryId = 1,
                Title = "Updated Title",
                Description = "Updated Description",
                Price = 1200,
                Quantity = 8
            };

            // Act
            var result = await itemService.UpdateAsync(1, updatedDto);

            // Assert
            Assert.True(result);
            repoMock.Verify(repo => repo.Update(It.Is<Item>(i => 
                i.Title == "Updated Title" && 
                i.Description == "Updated Description" && 
                i.Price == 1200 && 
                i.Quantity == 8)), Times.Once);
            repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }


        [Fact]
        public async Task UpdateAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            repoMock.Setup(repo => repo.GetByIdAsync(999, null))
                .ReturnsAsync((Item)null);

            var itemService = new ItemService(repoMock.Object);
            
            var updatedDto = new ItemDto
            {
                Title = "Updated Title",
                Description = "Updated Description",
                Price = 1200,
                Quantity = 8
            };

            // Act
            var result = await itemService.UpdateAsync(999, updatedDto);

            // Assert
            Assert.False(result);
            repoMock.Verify(repo => repo.Update(It.IsAny<Item>()), Times.Never);
            repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Never);
        }


        [Fact]
        public async Task DeleteAsync_WithValidId_ShouldDeleteItem()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var existingItem = new Item { ItemId = 1 };

            repoMock.Setup(repo => repo.GetByIdAsync(1, null))
                .ReturnsAsync(existingItem);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.DeleteAsync(1);

            // Assert
            Assert.True(result);
            repoMock.Verify(repo => repo.Delete(existingItem), Times.Once);
            repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }


        [Fact]
        public async Task DeleteAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            repoMock.Setup(repo => repo.GetByIdAsync(999, null))
                .ReturnsAsync((Item)null);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.DeleteAsync(999);

            // Assert
            Assert.False(result);
            repoMock.Verify(repo => repo.Delete(It.IsAny<Item>()), Times.Never);
            repoMock.Verify(repo => repo.SaveChangesAsync(), Times.Never);
        }


        [Fact]
        public async Task GetLatestEVsAsync_ShouldReturnLatestEVs()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var evItems = new List<Item>
            {
                new Item { ItemId = 1, ItemType = "EV", Title = "EV 1", Price = 10000 },
                new Item { ItemId = 2, ItemType = "EV", Title = "EV 2", Price = 15000 }
            };

            repoMock.Setup(repo => repo.GetLatestEVsAsync(5))
                .ReturnsAsync(evItems);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetLatestEVsAsync(5);

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal("EV", resultList[0].ItemType);
            Assert.Equal("EV", resultList[1].ItemType);
            Assert.Equal("EV 1", resultList[0].Title);
            Assert.Equal("EV 2", resultList[1].Title);
        }


        [Fact]
        public async Task GetLatestBatteriesAsync_ShouldReturnLatestBatteries()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var batteryItems = new List<Item>
            {
                new Item { ItemId = 3, ItemType = "Battery", Title = "Battery 1", Price = 5000 },
                new Item { ItemId = 4, ItemType = "Battery", Title = "Battery 2", Price = 7000 }
            };

            repoMock.Setup(repo => repo.GetLatestBatteriesAsync(5))
                .ReturnsAsync(batteryItems);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetLatestBatteriesAsync(5);

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal("Battery", resultList[0].ItemType);
            Assert.Equal("Battery", resultList[1].ItemType);
            Assert.Equal("Battery 1", resultList[0].Title);
            Assert.Equal("Battery 2", resultList[1].Title);
        }


        [Fact]
        public async Task SearchItemsAsync_ByItemType_ShouldReturnFilteredItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>
            {
                new ItemDto { ItemId = 1, ItemType = "EV", Title = "EV 1" },
                new ItemDto { ItemId = 2, ItemType = "EV", Title = "EV 2" },
                new ItemDto { ItemId = 3, ItemType = "Battery", Title = "Battery 1" }
            }.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(items.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(items.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(items.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(items.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("EV", "", null, null, 1, 20, "Price", "asc");

            // Assert
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(2, result.Items.Count());
            Assert.All(result.Items, item => Assert.Equal("EV", item.ItemType));
        }


        [Fact]
        public async Task SearchItemsAsync_ByTitle_ShouldReturnFilteredItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>
            {
                new ItemDto { ItemId = 1, ItemType = "EV", Title = "Tesla Model S" },
                new ItemDto { ItemId = 2, ItemType = "EV", Title = "Tesla Model 3" },
                new ItemDto { ItemId = 3, ItemType = "EV", Title = "Nissan Leaf" }
            }.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(items.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(items.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(items.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(items.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("", "Tesla", null, null, 1, 20, "Price", "asc");

            // Assert
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(2, result.Items.Count());
            Assert.All(result.Items, item => Assert.Contains("Tesla", item.Title));
        }


        [Fact]
        public async Task SearchItemsAsync_ByPriceRange_ShouldReturnFilteredItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>
            {
                new ItemDto { ItemId = 1, ItemType = "EV", Title = "Item 1", Price = 1000 },
                new ItemDto { ItemId = 2, ItemType = "EV", Title = "Item 2", Price = 2000 },
                new ItemDto { ItemId = 3, ItemType = "EV", Title = "Item 3", Price = 3000 },
                new ItemDto { ItemId = 4, ItemType = "EV", Title = "Item 4", Price = 4000 }
            }.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(items.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(items.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(items.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(items.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("", "", 2000, 3000, 1, 20, "Price", "asc");

            // Assert
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(2, result.Items.Count());
            Assert.All(result.Items, item => 
                Assert.InRange(item.Price.Value, 2000, 3000));
        }


        [Fact]
        public async Task SearchItemsAsync_WithPagination_ShouldReturnCorrectPage()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>();
            for (int i = 1; i <= 25; i++)
            {
                items.Add(new ItemDto { ItemId = i, Title = $"Item {i}" });
            }
            
            var queryableItems = items.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(queryableItems.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(queryableItems.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(queryableItems.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(queryableItems.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(queryableItems);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("", "", null, null, 2, 10, "Price", "asc");

            // Assert
            Assert.Equal(25, result.TotalCount);
            Assert.Equal(10, result.Items.Count());
            Assert.Equal(2, result.Page);
            Assert.Equal(10, result.PageSize);
            Assert.Equal(11, result.Items.First().ItemId); // Should start from the 11th item
        }


        [Fact]
        public async Task SearchItemsAsync_SortByPriceAscending_ShouldReturnSortedItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>
            {
                new ItemDto { ItemId = 1, Title = "Item 1", Price = 3000 },
                new ItemDto { ItemId = 2, Title = "Item 2", Price = 1000 },
                new ItemDto { ItemId = 3, Title = "Item 3", Price = 2000 }
            }.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(items.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(items.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(items.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(items.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("", "", null, null, 1, 10, "Price", "asc");

            // Assert
            var resultList = result.Items.ToList();
            Assert.Equal(3, resultList.Count);
            Assert.Equal(1000, resultList[0].Price);
            Assert.Equal(2000, resultList[1].Price);
            Assert.Equal(3000, resultList[2].Price);
        }


        [Fact]
        public async Task SearchItemsAsync_SortByPriceDescending_ShouldReturnSortedItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>
            {
                new ItemDto { ItemId = 1, Title = "Item 1", Price = 3000 },
                new ItemDto { ItemId = 2, Title = "Item 2", Price = 1000 },
                new ItemDto { ItemId = 3, Title = "Item 3", Price = 2000 }
            }.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(items.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(items.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(items.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(items.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("", "", null, null, 1, 10, "Price", "desc");

            // Assert
            var resultList = result.Items.ToList();
            Assert.Equal(3, resultList.Count);
            Assert.Equal(3000, resultList[0].Price);
            Assert.Equal(2000, resultList[1].Price);
            Assert.Equal(1000, resultList[2].Price);
        }


        [Fact]
        public async Task SearchItemsAsync_SortByTitle_ShouldReturnSortedItems()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            var items = new List<ItemDto>
            {
                new ItemDto { ItemId = 1, Title = "C Item" },
                new ItemDto { ItemId = 2, Title = "A Item" },
                new ItemDto { ItemId = 3, Title = "B Item" }
            }.AsQueryable();

            var mockDbSet = new Mock<DbSet<ItemDto>>();
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Provider).Returns(items.Provider);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.Expression).Returns(items.Expression);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.ElementType).Returns(items.ElementType);
            mockDbSet.As<IQueryable<ItemDto>>().Setup(m => m.GetEnumerator()).Returns(items.GetEnumerator());

            repoMock.Setup(repo => repo.QueryItemsWithSeller())
                .Returns(items);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.SearchItemsAsync("", "", null, null, 1, 10, "Title", "asc");

            // Assert
            var resultList = result.Items.ToList();
            Assert.Equal(3, resultList.Count);
            Assert.Equal("A Item", resultList[0].Title);
            Assert.Equal("B Item", resultList[1].Title);
            Assert.Equal("C Item", resultList[2].Title);
        }


        [Fact]
        public async Task GetItemWithDetailsAsync_WithValidId_ShouldReturnItemWithDetails()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var itemDetail = new ItemWithDetailDto
            {
                ItemId = 1,
                Title = "Test Item",
                Description = "Test Description",
                Price = 1000,
                ItemType = "EV",
                EVDetail = new Domain.Entities.EVDetail
                {
                    Brand = "Tesla",
                    Model = "Model S",
                    Year = 2020
                }
            };

            repoMock.Setup(repo => repo.GetItemWithDetailsAsync(1))
                .ReturnsAsync(itemDetail);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetItemWithDetailsAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ItemId);
            Assert.Equal("Test Item", result.Title);
            Assert.Equal("EV", result.ItemType);
            Assert.NotNull(result.EVDetail);
            Assert.Equal("Tesla", result.EVDetail.Brand);
            Assert.Equal("Model S", result.EVDetail.Model);
        }


        [Fact]
        public async Task GetItemWithDetailsAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            
            repoMock.Setup(repo => repo.GetItemWithDetailsAsync(999))
                .ReturnsAsync((ItemWithDetailDto)null);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetItemWithDetailsAsync(999);

            // Assert
            Assert.Null(result);
        }


        [Fact]
        public async Task GetAllItemsWithDetailsAsync_ShouldReturnAllItemsWithDetails()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var itemsWithDetails = new List<ItemWithDetailDto>
            {
                new ItemWithDetailDto
                {
                    ItemId = 1,
                    Title = "EV Item",
                    ItemType = "EV",
                    EVDetail = new Domain.Entities.EVDetail { Brand = "Tesla" }
                },
                new ItemWithDetailDto
                {
                    ItemId = 2,
                    Title = "Battery Item",
                    ItemType = "Battery",
                    BatteryDetail = new Domain.Entities.BatteryDetail { Brand = "LG" }
                }
            };

            repoMock.Setup(repo => repo.GetAllItemsWithDetailsAsync())
                .ReturnsAsync(itemsWithDetails);

            var itemService = new ItemService(repoMock.Object);

            // Act
            var result = await itemService.GetAllItemsWithDetailsAsync();

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            
            Assert.Equal(1, resultList[0].ItemId);
            Assert.Equal("EV", resultList[0].ItemType);
            Assert.NotNull(resultList[0].EVDetail);
            Assert.Equal("Tesla", resultList[0].EVDetail.Brand);
            
            Assert.Equal(2, resultList[1].ItemId);
            Assert.Equal("Battery", resultList[1].ItemType);
            Assert.NotNull(resultList[1].BatteryDetail);
            Assert.Equal("LG", resultList[1].BatteryDetail.Brand);
        }


        [Fact]
        public async Task CreateAsync_WithNullValues_ShouldSetDefaultValues()
        {
            // Arrange
            var repoMock = new Mock<IItemRepository>();
            var itemService = new ItemService(repoMock.Object);
            
            var itemDto = new ItemDto
            {
                Title = "Test Item",
                Description = "Test Description",
                Price = 1000,
                // Quantity is null
                // ItemType is null
            };

            // Act
            var result = await itemService.CreateAsync(itemDto);

            // Assert
            repoMock.Verify(repo => repo.AddAsync(It.Is<Item>(i => 
                i.Title == "Test Item" && 
                i.Description == "Test Description" && 
                i.Price == 1000 && 
                i.ItemType == "" && // Default empty string for null ItemType
                i.Status == "pending" && // Default status
                i.IsDeleted == false), null), // Default IsDeleted
                Times.Once);
        }
    }
}