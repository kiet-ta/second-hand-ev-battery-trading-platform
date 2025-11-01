using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;

namespace BackEnd.Application.Tests
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<IOrderItemRepository> _orderItemRepoMock;
        private readonly OrderService _service;

        public OrderServiceTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _orderItemRepoMock = new Mock<IOrderItemRepository>();
            _service = new OrderService(_orderRepoMock.Object, _orderItemRepoMock.Object);
        }

        // GET ORDER BY ID

        [Fact]
        public async Task GetOrderByIdAsync_ShouldReturnOrder_WhenExists()
        {
            var order = new Order
            {
                OrderId = 1,
                BuyerId = 2,
                AddressId = 3,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);

            var result = await _service.GetOrderByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal(order.OrderId, result.OrderId);
            Assert.Equal(order.BuyerId, result.BuyerId);
        }

        [Fact]
        public async Task GetOrderByIdAsync_ShouldReturnNull_WhenNotFound()
        {
            _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Order)null);

            var result = await _service.GetOrderByIdAsync(10);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetOrderByIdAsync_ShouldMapFieldsCorrectly()
        {
            var date = DateTime.UtcNow;
            var order = new Order { OrderId = 99, BuyerId = 5, AddressId = 1, Status = "done", CreatedAt = date };
            _orderRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync(order);

            var result = await _service.GetOrderByIdAsync(99);

            Assert.Equal(date, result.CreatedAt);
            Assert.Equal("done", result.Status);
        }

        // GET ALL ORDERS

        [Fact]
        public async Task GetAllOrdersAsync_ShouldReturnEmpty_WhenNoOrders()
        {
            _orderRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Order>());

            var result = await _service.GetAllOrdersAsync();

            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllOrdersAsync_ShouldReturnMappedList()
        {
            var orders = new List<Order>
            {
                new() { OrderId = 1, BuyerId = 1, AddressId = 11, Status = "done", CreatedAt = DateTime.UtcNow },
                new() { OrderId = 2, BuyerId = 2, AddressId = 22, Status = "pending", CreatedAt = DateTime.UtcNow }
            };
            _orderRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(orders);

            var result = (await _service.GetAllOrdersAsync()).ToList();

            Assert.Equal(2, result.Count);
            Assert.Equal(orders[0].OrderId, result[0].OrderId);
        }

        [Fact]
        public async Task GetAllOrdersAsync_ShouldHandleManyRecords()
        {
            var orders = Enumerable.Range(1, 100)
                .Select(i => new Order { OrderId = i, BuyerId = i, AddressId = i, Status = "pending", CreatedAt = DateTime.UtcNow })
                .ToList();

            _orderRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(orders);

            var result = await _service.GetAllOrdersAsync();

            Assert.Equal(100, result.Count());
        }

        // CREATE ORDER (OrderDto)

        [Fact]
        public async Task CreateOrderAsync_ShouldCallAddAsync()
        {
            var dto = new OrderDto
            {
                BuyerId = 5,
                AddressId = 99,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            Order? capturedOrder = null;

            _orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>()))
                .Callback<Order>(o => { o.OrderId = 123; capturedOrder = o; })
                .Returns(Task.CompletedTask);

            var resultId = await _service.CreateOrderAsync(dto);

            Assert.Equal(123, resultId);
            Assert.NotNull(capturedOrder);
            Assert.Equal("pending", capturedOrder.Status);
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldSetCreatedAtToToday()
        {
            var today = DateTime.UtcNow;

            _orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>()))
                .Callback<Order>(o => Assert.Equal(today, o.CreatedAt))
                .Returns(Task.CompletedTask);

            await _service.CreateOrderAsync(new OrderDto
            {
                BuyerId = 1,
                AddressId = 2,
                CreatedAt = today,
                UpdatedAt = today
            });
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldReturnGeneratedId()
        {
            var dto = new OrderDto { BuyerId = 1, AddressId = 2, CreatedAt = DateTime.UtcNow };
            _orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>()))
                .Callback<Order>(o => o.OrderId = 500)
                .Returns(Task.CompletedTask);

            var id = await _service.CreateOrderAsync(dto);

            Assert.Equal(500, id);
        }

        // D. UPDATE ORDER

        [Fact]
        public async Task UpdateOrderAsync_ShouldReturnFalse_WhenOrderNotFound()
        {
            _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Order)null);

            var result = await _service.UpdateOrderAsync(new OrderDto { OrderId = 999, Status = "done" });

            Assert.False(result);
        }

        [Fact]
        public async Task UpdateOrderAsync_ShouldUpdateStatus_WhenExists()
        {
            var order = new Order { OrderId = 1, Status = "pending" };
            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);

            var dto = new OrderDto { OrderId = 1, Status = "done" };

            var result = await _service.UpdateOrderAsync(dto);

            Assert.True(result);
            Assert.Equal("done", order.Status);
            _orderRepoMock.Verify(r => r.UpdateAsync(It.Is<Order>(o => o.Status == "done")), Times.Once);
        }

        [Fact]
        public async Task UpdateOrderAsync_ShouldCallRepositoryUpdateOnce()
        {
            var order = new Order { OrderId = 10, Status = "pending" };
            _orderRepoMock.Setup(r => r.GetByIdAsync(order.OrderId)).ReturnsAsync(order);

            await _service.UpdateOrderAsync(new OrderDto { OrderId = 10, Status = "done" });

            _orderRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Order>()), Times.Once);
        }

        // E. DELETE ORDER

        [Fact]
        public async Task DeleteOrderAsync_ShouldCallRepositoryDelete()
        {
            _orderRepoMock.Setup(r => r.DeleteAsync(5)).Returns(Task.CompletedTask);

            var result = await _service.DeleteOrderAsync(5);

            Assert.True(result);
            _orderRepoMock.Verify(r => r.DeleteAsync(5), Times.Once);
        }

        [Fact]
        public async Task DeleteOrderAsync_ShouldAlwaysReturnTrue()
        {
            // Arrange
            var orderRepoMock = new Mock<IOrderRepository>();
            orderRepoMock
                .Setup(x => x.DeleteAsync(It.IsAny<int>()))
                .Returns(Task.CompletedTask); // không ném lỗi, chỉ giả lập xóa thành công

            var orderItemRepoMock = new Mock<IOrderItemRepository>();
            var service = new OrderService(orderRepoMock.Object, orderItemRepoMock.Object);

            // Act
            var result = await service.DeleteOrderAsync(1);

            // Assert
            Assert.True(result);
            orderRepoMock.Verify(x => x.DeleteAsync(1), Times.Once);
        }

        // F. GET ORDERS BY USER ID

        [Fact]
        public async Task GetOrdersByUserIdAsync_ShouldReturnList()
        {
            var orders = new List<OrderDto> { new() { OrderId = 1, BuyerId = 10 } };
            _orderRepoMock.Setup(r => r.GetOrdersByUserIdAsync(10)).ReturnsAsync(orders);

            var result = await _service.GetOrdersByUserIdAsync(10);

            Assert.Single(result);
            Assert.Equal(10, result.First().BuyerId);
        }

        [Fact]
        public async Task GetOrdersByUserIdAsync_ShouldReturnEmptyList_WhenNoOrder()
        {
            _orderRepoMock.Setup(r => r.GetOrdersByUserIdAsync(99)).ReturnsAsync(new List<OrderDto>());

            var result = await _service.GetOrdersByUserIdAsync(99);

            Assert.Empty(result);
        }

        // G. CREATE ORDER (CreateOrderRequestDto)

        [Fact]
        public async Task CreateOrder_Request_ShouldCreateOrderAndAttachItems()
        {
            var req = new CreateOrderRequestDto
            {
                BuyerId = 1,
                AddressId = 2,
                OrderItemIds = new List<int> { 10, 20 },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var items = new List<OrderItem>
            {
                new() { OrderItemId = 10, ItemId = 5, Quantity = 1, Price = 100 },
                new() { OrderItemId = 20, ItemId = 6, Quantity = 2, Price = 200 }
            };

            _orderItemRepoMock.Setup(r => r.GetItemsByIdsAsync(It.IsAny<List<int>>())).ReturnsAsync(items);
            _orderRepoMock.Setup(r => r.AddOrderAsync(It.IsAny<Order>())).ReturnsAsync(new Order { OrderId = 777 });

            var response = await _service.CreateOrderAsync(req);

            Assert.Equal(777, response.OrderId);
            Assert.All(response.Items, i => Assert.Equal(777, i.OrderId));
            _orderItemRepoMock.Verify(r => r.UpdateRangeAsync(It.IsAny<IEnumerable<OrderItem>>()), Times.Once);
        }

        [Fact]
        public async Task CreateOrder_Request_ShouldThrow_WhenNoValidItems()
        {
            var req = new CreateOrderRequestDto { BuyerId = 1, AddressId = 2, OrderItemIds = new List<int> { 99 } };
            _orderItemRepoMock.Setup(r => r.GetItemsByIdsAsync(It.IsAny<List<int>>())).ReturnsAsync(new List<OrderItem>());

            await Assert.ThrowsAsync<Exception>(() => _service.CreateOrderAsync(req));
        }

        [Fact]
        public async Task CreateOrder_Request_ShouldSetStatusPending()
        {
            var req = new CreateOrderRequestDto { BuyerId = 1, AddressId = 2, OrderItemIds = new List<int> { 1 } };
            _orderItemRepoMock.Setup(r => r.GetItemsByIdsAsync(It.IsAny<List<int>>())).ReturnsAsync(new List<OrderItem> { new() { OrderItemId = 1 } });

            Order? addedOrder = null;
            _orderRepoMock.Setup(r => r.AddOrderAsync(It.IsAny<Order>()))
                .Callback<Order>(o => addedOrder = o)
                .ReturnsAsync(new Order { OrderId = 888 });

            await _service.CreateOrderAsync(req);

            Assert.NotNull(addedOrder);
            Assert.Equal("pending", addedOrder.Status);
        }
    }
}