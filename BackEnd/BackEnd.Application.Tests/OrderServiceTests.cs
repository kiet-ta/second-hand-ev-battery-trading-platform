// File: BackEnd.Application.Tests/OrderServiceTests.cs
// Required Packages: Moq, Xunit

using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;
using System; // Required for Exception
using System.Collections.Generic;
using System.Linq; // Required for .ToList()
using System.Threading.Tasks;
using Xunit;

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

        // === 1. GET ORDER BY ID ===

        [Fact]
        public async Task GetOrderByIdAsync_ShouldReturnOrder_WhenExists()
        {
            // Arrange
            var order = new Order
            {
                OrderId = 1,
                BuyerId = 2,
                AddressId = 3,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);

            // Act
            var result = await _service.GetOrderByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(order.OrderId, result.OrderId);
            Assert.Equal(order.BuyerId, result.BuyerId);
        }

        [Fact]
        public async Task GetOrderByIdAsync_ShouldThrowException_WhenNotFound()
        {
            // Arrange
            // CẢI THIỆN: Mock the repository to return null
            _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Order)null);

            // Act
            // CẢI THIỆN: The service throws an Exception, it does not return null.
            Func<Task> act = () => _service.GetOrderByIdAsync(10);

            // Assert
            // CẢI THIỆN: Verify that the correct exception is thrown.
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal("Order with ID 10 not found.", exception.Message);
        }

        // === 2. GET ALL ORDERS ===

        [Fact]
        public async Task GetAllOrdersAsync_ShouldReturnEmptyList_WhenNoOrders()
        {
            // Arrange
            // CẢI THIỆN: Mock the repo to return an empty list
            _orderRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Order>());

            // Act
            // CẢI THIỆN: The service throws an Exception if the list is empty
            Func<Task> act = () => _service.GetAllOrdersAsync();

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal("No orders found.", exception.Message);
        }

        [Fact]
        public async Task GetAllOrdersAsync_ShouldReturnMappedList_WhenOrdersExist()
        {
            // Arrange
            var orders = new List<Order>
            {
                new() { OrderId = 1, BuyerId = 1, AddressId = 11, Status = "done" },
                new() { OrderId = 2, BuyerId = 2, AddressId = 22, Status = "pending" }
            };
            _orderRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(orders);

            // Act
            var result = (await _service.GetAllOrdersAsync()).ToList();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal(orders[0].OrderId, result[0].OrderId);
            Assert.Equal(orders[1].Status, result[1].Status);
        }

        // === 3. CREATE ORDER (from OrderDto) ===

        [Fact]
        public async Task CreateOrderAsync_Dto_ShouldCallAddAsync_AndSetPendingStatus()
        {
            // Arrange
            var dto = new OrderDto
            {
                BuyerId = 5,
                AddressId = 99,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            Order capturedOrder = null; // Variable to capture the entity

            // CẢI THIỆN: Setup AddAsync to capture the order and assign an ID
            _orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>()))
                .Callback<Order>(o =>
                {
                    o.OrderId = 123; // Simulate the DB generating an ID
                    capturedOrder = o;
                })
                .Returns(Task.CompletedTask);

            // Act
            var resultId = await _service.CreateOrderAsync(dto);

            // Assert
            Assert.Equal(123, resultId); // Verify the returned ID is correct
            Assert.NotNull(capturedOrder); // Verify the entity was captured
            Assert.Equal("pending", capturedOrder.Status); // Verify status was set
            Assert.Equal(5, capturedOrder.BuyerId);
            Assert.Equal(dto.CreatedAt, capturedOrder.CreatedAt);
        }

        [Fact]
        public async Task CreateOrderAsync_Dto_ShouldThrowException_WhenDtoIsNull()
        {
            // Arrange
            // No setup needed

            // Act
            Func<Task> act = () => _service.CreateOrderAsync((OrderDto)null);

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal("Order data cannot be null.", exception.Message);
        }

        // === 4. UPDATE ORDER ===

        [Fact]
        public async Task UpdateOrderAsync_ShouldThrowException_WhenOrderNotFound()
        {
            // Arrange
            // CẢI THIỆN: Mock the repo to return null
            _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Order)null);
            var dto = new OrderDto { OrderId = 999, Status = "done" };

            // Act
            // CẢI THIỆN: The service throws an Exception, it does not return false.
            Func<Task> act = () => _service.UpdateOrderAsync(dto);

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal($"Order with ID {dto.OrderId} not found.", exception.Message);
        }

        // === 5. DELETE ORDER ===

        [Fact]
        public async Task DeleteOrderAsync_ShouldThrowException_WhenOrderNotFound()
        {
            // Arrange
            // CẢI THIỆN: Add test for "sad path"
            _orderRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Order)null);

            // Act
            Func<Task> act = () => _service.DeleteOrderAsync(999);

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal("Order with ID 999 not found.", exception.Message);
            _orderRepoMock.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never); // Ensure delete was not called
        }

        [Fact]
        public async Task DeleteOrderAsync_ShouldCallRepositoryDelete_WhenOrderExists()
        {
            // Arrange
            var order = new Order { OrderId = 5 };
            _orderRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(order);
            _orderRepoMock.Setup(r => r.DeleteAsync(5)).Returns(Task.CompletedTask);

            // Act
            var result = await _service.DeleteOrderAsync(5);

            // Assert
            Assert.True(result); // Service returns true on success
            _orderRepoMock.Verify(r => r.DeleteAsync(5), Times.Once); // Verify delete was called
        }

        // === 6. GET ORDERS BY USER ID ===

        [Fact]
        public async Task GetOrdersByUserIdAsync_ShouldReturnList_WhenOrdersExist()
        {
            // Arrange
            var orders = new List<OrderDto> { new() { OrderId = 1, BuyerId = 10 } };
            _orderRepoMock.Setup(r => r.GetOrdersByUserIdAsync(10)).ReturnsAsync(orders);

            // Act
            var result = await _service.GetOrdersByUserIdAsync(10);

            // Assert
            Assert.Single(result);
            Assert.Equal(10, result.First().BuyerId);
        }

        [Fact]
        public async Task GetOrdersByUserIdAsync_ShouldThrowException_WhenNoOrder()
        {
            // Arrange
            // CẢI THIỆN: Mock repo to return an empty list
            _orderRepoMock.Setup(r => r.GetOrdersByUserIdAsync(99)).ReturnsAsync(new List<OrderDto>());

            // Act
            // CẢI THIỆN: The service throws an Exception if the list is empty
            Func<Task> act = () => _service.GetOrdersByUserIdAsync(99);

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal("No orders found for user ID 99.", exception.Message);
        }

        // === 7. CREATE ORDER (from CreateOrderRequestDto) ===

        [Fact]
        public async Task CreateOrder_Request_ShouldCreateOrderAndAttachItems()
        {
            // Arrange
            var req = new CreateOrderRequestDto
            {
                BuyerId = 1,
                AddressId = 2,
                OrderItemIds = new List<int> { 10, 20 },
                CreatedAt = DateTime.UtcNow
            };

            var itemsToUpdate = new List<OrderItem>
            {
                new() { OrderItemId = 10, ItemId = 5, OrderId = null }, // OrderId is initially null
                new() { OrderItemId = 20, ItemId = 6, OrderId = null }
            };

            var createdOrder = new Order { OrderId = 777, BuyerId = 1, AddressId = 2, Status = "pending" };

            _orderItemRepoMock.Setup(r => r.GetItemsByIdsAsync(req.OrderItemIds)).ReturnsAsync(itemsToUpdate);
            _orderRepoMock.Setup(r => r.AddOrderAsync(It.IsAny<Order>())).ReturnsAsync(createdOrder);

            // Act
            var response = await _service.CreateOrderAsync(req);

            // Assert
            Assert.NotNull(response);
            Assert.Equal(777, response.OrderId); // Check returned Order ID

            // FIXME: type: int but response.Items.Count will error if not ToString so temp int 2 -> "2" to check
            Assert.Equal("2", response.Items.Count().ToString()); // Check returned items

            // Verify that the OrderItems were updated with the new OrderId
            Assert.All(itemsToUpdate, item => Assert.Equal(777, item.OrderId));

            // Verify the correct repositories were called
            _orderRepoMock.Verify(r => r.AddOrderAsync(It.Is<Order>(o => o.Status == "pending" && o.BuyerId == 1)), Times.Once);
            _orderItemRepoMock.Verify(r => r.UpdateRangeAsync(itemsToUpdate), Times.Once);
        }

        [Fact]
        public async Task CreateOrder_Request_ShouldThrowInvalidOperationException_WhenNoValidItems()
        {
            // Arrange
            var req = new CreateOrderRequestDto { BuyerId = 1, AddressId = 2, OrderItemIds = new List<int> { 99 } };
            // CẢI THIỆN: Mock GetItemsByIdsAsync to return an empty list
            _orderItemRepoMock.Setup(r => r.GetItemsByIdsAsync(It.IsAny<List<int>>()))
                              .ReturnsAsync(new List<OrderItem>());

            // Act
            Func<Task> act = () => _service.CreateOrderAsync(req);

            // Assert
            // CẢI THIỆN: Check for the specific exception type
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(act);
            Assert.Equal("No valid order items found", exception.Message);
            _orderRepoMock.Verify(r => r.AddOrderAsync(It.IsAny<Order>()), Times.Never); // Ensure no order was created
        }

        [Fact]
        public async Task CreateOrder_Request_ShouldThrowException_WhenCreateOrderFails()
        {
            // Arrange
            var req = new CreateOrderRequestDto { BuyerId = 1, AddressId = 2, OrderItemIds = new List<int> { 1 } };
            _orderItemRepoMock.Setup(r => r.GetItemsByIdsAsync(It.IsAny<List<int>>()))
                              .ReturnsAsync(new List<OrderItem> { new() { OrderItemId = 1 } });

            // CẢI THIỆN: Mock AddOrderAsync to return null (simulating a DB failure)
            _orderRepoMock.Setup(r => r.AddOrderAsync(It.IsAny<Order>()))
                          .ReturnsAsync((Order)null);

            // Act
            Func<Task> act = () => _service.CreateOrderAsync(req);

            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Equal("Failed to create order.", exception.Message);
            _orderItemRepoMock.Verify(r => r.UpdateRangeAsync(It.IsAny<IEnumerable<OrderItem>>()), Times.Never);
        }
    }
}