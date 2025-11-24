using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IServices;
using Application.Services;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Domain.Entities;
using Application.IRepositories;

public class OrderItemServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IOrderItemRepository> _mockRepo;
    private readonly OrderItemService _service;

    public OrderItemServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockRepo = new Mock<IOrderItemRepository>();
        _mockUow.Setup(u => u.OrderItems).Returns(_mockRepo.Object);
        _service = new OrderItemService(_mockUow.Object);
    }

    [Fact] public async Task CreateOrderItemAsync_ShouldThrow_WhenRequestIsNull() => await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateOrderItemAsync(null));
    [Fact] public async Task CreateOrderItemAsync_ShouldThrow_WhenQuantityInvalid() => await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateOrderItemAsync(new CreateOrderItemRequest { Quantity = 0 }));
    [Fact] public async Task CreateOrderItemAsync_ShouldThrow_WhenPriceNegative() => await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateOrderItemAsync(new CreateOrderItemRequest { BuyerId = 1, ItemId = 1, Quantity = 1, Price = -10 }));
    [Fact] public async Task CreateOrderItemAsync_ShouldThrow_WhenBuyerIdInvalid() => await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateOrderItemAsync(new CreateOrderItemRequest { BuyerId = 0, ItemId = 1, Quantity = 1 }));

    [Fact]
    public async Task CreateOrderItemAsync_ShouldThrow_WhenItemNotFound()
    {
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(new List<OrderItem> { new OrderItem { BuyerId = 1, ItemId = 10 } });
        _mockUow.Setup(u => u.Items.GetByIdAsync(10, default)).ReturnsAsync((Item)null);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateOrderItemAsync(new CreateOrderItemRequest { BuyerId = 1, ItemId = 10, Quantity = 1 }));
    }

    [Fact]
    public async Task CreateOrderItemAsync_ShouldAddQuantity_WhenExistingCartFound()
    {
        var existing = new OrderItem { OrderItemId = 1, BuyerId = 1, ItemId = 10, Quantity = 2, Price = 100 };
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(new List<OrderItem> { existing });
        _mockUow.Setup(u => u.Items.GetByIdAsync(10, default)).ReturnsAsync(new Item { ItemId = 10, Quantity = 10 });
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>()))
                 .Callback<OrderItem>(item => { existing.Quantity = item.Quantity; existing.Price = item.Price; })
                 .Returns(Task.CompletedTask);

        var req = new CreateOrderItemRequest { BuyerId = 1, ItemId = 10, Quantity = 3, Price = 150 };
        var result = await _service.CreateOrderItemAsync(req);
        Assert.Equal(5, existing.Quantity);
        Assert.Equal(150, existing.Price);
    }

    [Fact]
    public async Task CreateOrderItemAsync_ShouldThrow_WhenStockExceeded()
    {
        var existing = new OrderItem { BuyerId = 1, ItemId = 10, Quantity = 5 };
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(new List<OrderItem> { existing });
        _mockUow.Setup(u => u.Items.GetByIdAsync(10, default)).ReturnsAsync(new Item { ItemId = 10, Quantity = 7 });
        var req = new CreateOrderItemRequest { BuyerId = 1, ItemId = 10, Quantity = 3 };
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateOrderItemAsync(req));
    }

    [Fact]
    public async Task CreateOrderItemAsync_ShouldHandleMultipleExistingItems()
    {
        var existing = new OrderItem { BuyerId = 1, ItemId = 1, Quantity = 2 };
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(new List<OrderItem> { existing });
        _mockUow.Setup(u => u.Items.GetByIdAsync(1, default)).ReturnsAsync(new Item { ItemId = 1, Quantity = 10 });
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>()))
                 .Callback<OrderItem>(item => existing.Quantity = item.Quantity)
                 .Returns(Task.CompletedTask);
        var req = new CreateOrderItemRequest { BuyerId = 1, ItemId = 1, Quantity = 3 };
        var result = await _service.CreateOrderItemAsync(req);
        Assert.Equal(5, existing.Quantity);
    }

    [Fact]
    public async Task CreateOrderItemAsync_ShouldThrow_WhenRepoThrows()
    {
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).Throws(new Exception());
        await Assert.ThrowsAsync<Exception>(() => _service.CreateOrderItemAsync(new CreateOrderItemRequest { BuyerId = 1, ItemId = 1, Quantity = 1 }));
    }

    [Fact]
    public async Task GetCartItemsByBuyerIdAsync_ShouldReturnEmpty_WhenNoItems()
    {
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(new List<OrderItem>());
        var result = await _service.GetCartItemsByBuyerIdAsync(1);
        Assert.Empty(result);
    }
    [Fact] public async Task GetCartItemsByBuyerIdAsync_ShouldThrow_WhenInvalidBuyerId() => await Assert.ThrowsAsync<ArgumentException>(() => _service.GetCartItemsByBuyerIdAsync(0));
    [Fact] public async Task GetCartItemsByBuyerIdAsync_ShouldThrow_WhenBuyerIdNegative() => await Assert.ThrowsAsync<ArgumentException>(() => _service.GetCartItemsByBuyerIdAsync(-1));
    [Fact]
    public async Task GetCartItemsByBuyerIdAsync_ShouldReturnItems_WhenExists()
    {
        var list = new List<OrderItem> { new OrderItem { OrderItemId = 1, Quantity = 2, Price = 100 } };
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(list);
        var result = await _service.GetCartItemsByBuyerIdAsync(1);
        Assert.Single(result);
        Assert.Equal(2, result.First().Quantity);
        Assert.Equal(100, result.First().Price);
    }

    [Fact] public async Task UpdateOrderItemAsync_ShouldThrow_WhenDtoNull() => await Assert.ThrowsAsync<ArgumentNullException>(() => _service.UpdateOrderItemAsync(1, null));
    [Fact]
    public async Task UpdateOrderItemAsync_ShouldThrow_WhenNotFound()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((OrderItem)null);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Quantity = 1 }));
    }
    [Fact]
    public async Task UpdateOrderItemAsync_ShouldThrow_WhenDeleted()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new OrderItem { IsDeleted = true });
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Quantity = 1 }));
    }
    [Fact]
    public async Task UpdateOrderItemAsync_ShouldThrow_WhenQuantityInvalid()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new OrderItem { IsDeleted = false });
        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Quantity = 0 }));
    }
    [Fact]
    public async Task UpdateOrderItemAsync_ShouldThrow_WhenPriceNegative()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new OrderItem { IsDeleted = false });
        await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Price = -5, Quantity = 1 }));
    }
  
    [Fact]
    public async Task UpdateOrderItemAsync_ShouldReturnTrue_WhenSuccess()
    {
        var item = new OrderItem { IsDeleted = false, Quantity = 1 };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>()))
                 .Callback<OrderItem>(i => item.Quantity = i.Quantity)
                 .Returns(Task.CompletedTask);

        var result = await _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Quantity = 5 });
        Assert.True(result);
        Assert.Equal(5, item.Quantity);
    }
    [Fact]
    public async Task UpdateOrderItemAsync_ShouldUpdateMultipleFields()
    {
        var item = new OrderItem { IsDeleted = false, Quantity = 1, Price = 10 };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>()))
                 .Callback<OrderItem>(i => { item.Quantity = i.Quantity; item.Price = i.Price; })
                 .Returns(Task.CompletedTask);

        var result = await _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Quantity = 5, Price = 50 });
        Assert.True(result);
        Assert.Equal(5, item.Quantity);
        Assert.Equal(50, item.Price);
    }

    [Fact]
    public async Task UpdateOrderItemAsync_ShouldAllowExactStock()
    {
        var item = new OrderItem { IsDeleted = false, Quantity = 5 };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>()))
                 .Callback<OrderItem>(i => item.Quantity = i.Quantity)
                 .Returns(Task.CompletedTask);

        var result = await _service.UpdateOrderItemAsync(1, new UpdateOrderItemDto { Quantity = 5 });
        Assert.True(result);
        Assert.Equal(5, item.Quantity);
    }

    [Fact] public async Task DeleteOrderItemAsync_ShouldThrow_WhenInvalidId() => await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteOrderItemAsync(0));
    [Fact] public async Task DeleteOrderItemAsync_ShouldThrow_WhenIdNegative() => await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteOrderItemAsync(-1));
    [Fact]
    public async Task DeleteOrderItemAsync_ShouldThrow_WhenNotFound()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((OrderItem)null);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteOrderItemAsync(1));
    }
    [Fact]
    public async Task DeleteOrderItemAsync_ShouldThrow_WhenAlreadyDeleted()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new OrderItem { IsDeleted = true });
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteOrderItemAsync(1));
    }
    [Fact]
    public async Task DeleteOrderItemAsync_ShouldThrow_WhenAlreadyPartOfOrder()
    {
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new OrderItem { OrderId = 100, IsDeleted = false });
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteOrderItemAsync(1));
    }
    [Fact]
    public async Task DeleteOrderItemAsync_ShouldReturnTrue_WhenSuccess()
    {
        var item = new OrderItem { IsDeleted = false };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>()))
                 .Callback<OrderItem>(i => item.IsDeleted = true)
                 .Returns(Task.CompletedTask);

        var result = await _service.DeleteOrderItemAsync(1);
        Assert.True(result);
        Assert.True(item.IsDeleted);
    }

    [Fact]
    public async Task DeleteOrderItemAsync_ShouldThrow_WhenRepoThrows()
    {
        var item = new OrderItem { IsDeleted = false };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<OrderItem>())).Throws(new Exception());
        await Assert.ThrowsAsync<Exception>(() => _service.DeleteOrderItemAsync(1));
    }
    [Fact]
    public async Task CreateOrderItemAsync_ShouldUpdateQuantityAndPriceAccordingToUnitPrice()
    {
   
        var item = new Item { ItemId = 10, Price = 100, Quantity = 10 };
        _mockUow.Setup(u => u.Items.GetByIdAsync(10, default)).ReturnsAsync(item);


        var existing = new OrderItem { OrderItemId = 1, BuyerId = 1, ItemId = 10, Quantity = 2, Price = 200 };
        _mockRepo.Setup(r => r.GetCartItemsByBuyerIdAsync(1)).ReturnsAsync(new List<OrderItem> { existing });

  
        _mockRepo.Setup(r => r.UpdateAsync(existing)).Returns(Task.CompletedTask);

        var req = new CreateOrderItemRequest
        {
            BuyerId = 1,
            ItemId = 10,
            Quantity = 3,
            Price = 0 
        };

        var result = await _service.CreateOrderItemAsync(req);

       
        Assert.Equal(5, existing.Quantity);

        Assert.Equal(500, existing.Price);
    }

}
