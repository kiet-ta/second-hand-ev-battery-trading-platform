using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Application.Services;
using Domain.Common.Constants;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class OrderServiceTests
    {
        private readonly Mock<IUnitOfWork> _uow;
        private readonly Mock<IOrderRepository> _orderRepo;
        private readonly Mock<IOrderItemRepository> _orderItemRepo;
        private readonly Mock<IItemRepository> _itemRepo;
        private readonly Mock<IWalletRepository> _walletRepo;
        private readonly Mock<IWalletTransactionRepository> _walletTransRepo;
        private readonly Mock<ILogger<OrderService>> _logger;
        private readonly OrderService _service;

        public OrderServiceTests()
        {
            _uow = new Mock<IUnitOfWork>();
            _orderRepo = new Mock<IOrderRepository>();
            _orderItemRepo = new Mock<IOrderItemRepository>();
            _itemRepo = new Mock<IItemRepository>();
            _walletRepo = new Mock<IWalletRepository>();
            _walletTransRepo = new Mock<IWalletTransactionRepository>();
            _logger = new Mock<ILogger<OrderService>>();

            _uow.Setup(x => x.Orders).Returns(_orderRepo.Object);
            _uow.Setup(x => x.OrderItems).Returns(_orderItemRepo.Object);
            _uow.Setup(x => x.Items).Returns(_itemRepo.Object);
            _uow.Setup(x => x.Wallets).Returns(_walletRepo.Object);
            _uow.Setup(x => x.WalletTransactions).Returns(_walletTransRepo.Object);

            _service = new OrderService(_uow.Object, _logger.Object);
        }

        [Fact]
        public async Task GetOrderByIdAsync_ReturnsOrder()
        {
            var order = new Order { OrderId = 1, BuyerId = 2, AddressId = 3, Status = "Pending" };
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            var result = await _service.GetOrderByIdAsync(1);
            Assert.NotNull(result);
            Assert.Equal(1, result.OrderId);
        }

        [Fact]
        public async Task GetOrderByIdAsync_Throws_WhenNotFound()
        {
            _orderRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync((Order)null);
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.GetOrderByIdAsync(10));
            Assert.Equal("Order with ID 10 not found.", ex.Message);
        }

        [Fact]
        public async Task GetAllOrdersAsync_Throws_WhenEmpty()
        {
            _orderRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Order>());
            await Assert.ThrowsAsync<Exception>(() => _service.GetAllOrdersAsync());
        }

        [Fact]
        public async Task GetAllOrdersAsync_ReturnsList()
        {
            var orders = new List<Order>
            {
                new Order { OrderId = 1 },
                new Order { OrderId = 2 }
            };
            _orderRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(orders);
            var result = (await _service.GetAllOrdersAsync()).ToList();
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task CreateOrderAsync_Throws_WhenNull()
        {
            await Assert.ThrowsAsync<Exception>(() => _service.CreateOrderAsync((OrderDto)null));
        }

        [Fact]
        public async Task CreateOrderAsync_AddsOrder()
        {
            var dto = new OrderDto { BuyerId = 1, AddressId = 2, CreatedAt = DateTime.Now };
            Order capturedOrder = null;

            _orderRepo.Setup(r => r.AddAsync(It.IsAny<Order>()))
                .Callback<Order>(o => { o.OrderId = 100; capturedOrder = o; })
                .Returns(Task.CompletedTask);

            var id = await _service.CreateOrderAsync(dto);
            Assert.Equal(100, id);
            Assert.Equal("Pending", capturedOrder.Status);
        }

        [Fact]
        public async Task UpdateOrderAsync_Throws_WhenNotFound()
        {
            _orderRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Order)null);
            var dto = new OrderDto { OrderId = 999, Status = "Done" };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.UpdateOrderAsync(dto));
            Assert.Equal("Order with ID 999 not found.", ex.Message);
        }

        [Fact]
        public async Task UpdateOrderAsync_Updates()
        {
            var order = new Order { OrderId = 1 };
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _orderRepo.Setup(r => r.UpdateAsync(order)).Returns(Task.CompletedTask);
            var dto = new OrderDto { OrderId = 1, Status = "Done" };
            var result = await _service.UpdateOrderAsync(dto);
            Assert.True(result);
            Assert.Equal("Done", order.Status);
        }

        [Fact]
        public async Task DeleteOrderAsync_Throws_WhenNotFound()
        {
            _orderRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Order)null);
            await Assert.ThrowsAsync<Exception>(() => _service.DeleteOrderAsync(999));
        }

        [Fact]
        public async Task DeleteOrderAsync_Deletes()
        {
            var order = new Order { OrderId = 5 };
            _orderRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(order);
            _orderRepo.Setup(r => r.DeleteAsync(5)).Returns(Task.CompletedTask);
            var result = await _service.DeleteOrderAsync(5);
            Assert.True(result);
        }

        [Fact]
        public async Task GetOrdersByUserIdAsync_Returns()
        {
            var list = new List<OrderDto> { new OrderDto { OrderId = 1, BuyerId = 10 } };
            _orderRepo.Setup(r => r.GetOrdersByUserIdAsync(10)).ReturnsAsync(list);
            var result = await _service.GetOrdersByUserIdAsync(10);
            Assert.Single(result);
        }

        [Fact]
        public async Task GetOrdersByUserIdAsync_Throws_WhenEmpty()
        {
            _orderRepo.Setup(r => r.GetOrdersByUserIdAsync(10)).ReturnsAsync(new List<OrderDto>());
            await Assert.ThrowsAsync<Exception>(() => _service.GetOrdersByUserIdAsync(10));
        }

        [Fact]
        public async Task CreateOrderRequest_Throws_WhenRequestNull()
        {
            await Assert.ThrowsAsync<Exception>(() => _service.CreateOrderAsync((CreateOrderRequestDto)null));
        }

        [Fact]
        public async Task CreateOrderRequest_Throws_WhenNoItems()
        {
            var req = new CreateOrderRequestDto { OrderItemIds = new List<int> { 1 } };
            _orderItemRepo.Setup(r => r.GetItemsByIdsAsync(req.OrderItemIds)).ReturnsAsync(new List<OrderItem>());
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateOrderAsync(req));
        }

        [Fact]
        public async Task CreateOrderRequest_Throws_WhenOrderFails()
        {
            var req = new CreateOrderRequestDto { OrderItemIds = new List<int> { 1 } };
            var items = new List<OrderItem> { new OrderItem { OrderItemId = 1 } };

            _orderItemRepo.Setup(r => r.GetItemsByIdsAsync(req.OrderItemIds)).ReturnsAsync(items);
            _orderRepo.Setup(r => r.AddOrderAsync(It.IsAny<Order>())).ReturnsAsync((Order)null);

            await Assert.ThrowsAsync<Exception>(() => _service.CreateOrderAsync(req));
        }



        [Fact]
        public async Task ConfirmShipping_Throws_WhenOrderNotFound()
        {
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Order)null);
            await Assert.ThrowsAsync<Exception>(() => _service.ConfirmOrderShippingAsync(1, 1));
        }

        [Fact]
        public async Task ConfirmShipping_Throws_WhenNotPaid()
        {
            var order = new Order { OrderId = 1, Status = "Pending" };
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.ConfirmOrderShippingAsync(1, 1));
        }

        [Fact]
        public async Task ConfirmShipping_UpdatesStatus()
        {
            var order = new Order { OrderId = 1, Status = "Paid" };
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _orderRepo.Setup(r => r.UpdateAsync(order)).Returns(Task.CompletedTask);

            await _service.ConfirmOrderShippingAsync(1, 1);
            Assert.Equal("Shipped", order.Status);
        }

        [Fact]
        public async Task ConfirmDelivery_Throws_WhenOrderNotFound()
        {
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Order)null);
            await Assert.ThrowsAsync<Exception>(() => _service.ConfirmOrderDeliveryAsync(1, 1));
        }

        [Fact]
        public async Task ConfirmDelivery_Throws_WhenBuyerWrong()
        {
            var order = new Order { OrderId = 1, BuyerId = 99, Status = "Shipped" };
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            await Assert.ThrowsAsync<Exception>(() => _service.ConfirmOrderDeliveryAsync(1, 1));
        }

        [Fact]
        public async Task ConfirmDelivery_Throws_WhenNotShipped()
        {
            var order = new Order { OrderId = 1, BuyerId = 1, Status = "Paid" };
            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.ConfirmOrderDeliveryAsync(1, 1));
        }

        [Fact]
        public async Task ConfirmDelivery_Throws_WhenOrderItemMissing()
        {
            var order = new Order { OrderId = 1, BuyerId = 1, Status = "Shipped" };

            _orderRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _orderItemRepo.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync(new List<OrderItem>());

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.ConfirmOrderDeliveryAsync(1, 1));
        }


    }
}
