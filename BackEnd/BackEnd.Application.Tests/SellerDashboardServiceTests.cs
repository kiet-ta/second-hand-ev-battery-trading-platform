using Application.DTOs;
//using Application.DTOs.OrdersByWeekDto;
//using Application.DTOs.RevenueByWeekDto;
using Application.IRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.Services;
using Domain.Common.Constants;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class SellerDashboardServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IItemRepository> _mockItemRepo;
        private readonly Mock<IOrderRepository> _mockOrderRepo;
        private readonly Mock<IPaymentDetailRepository> _mockPaymentDetailRepo;
        private readonly SellerDashboardService _sellerService;

        // Dữ liệu mẫu chung
        private readonly int SellerId = 10;

        public SellerDashboardServiceTests()
        {
            // --- Setup Mocks ---
            _mockUow = new Mock<IUnitOfWork>();
            _mockItemRepo = new Mock<IItemRepository>();
            _mockOrderRepo = new Mock<IOrderRepository>();
            _mockPaymentDetailRepo = new Mock<IPaymentDetailRepository>();

            _mockUow.SetupGet(u => u.Items).Returns(_mockItemRepo.Object);
            _mockUow.SetupGet(u => u.Orders).Returns(_mockOrderRepo.Object);
            _mockUow.SetupGet(u => u.PaymentDetails).Returns(_mockPaymentDetailRepo.Object);

            _sellerService = new SellerDashboardService(_mockUow.Object);
        }

        // Phương thức Setup chung để tạo dữ liệu thành công mặc định
        private void SetupSuccessMocks(int listings = 10, int orders = 5, int sold = 8, decimal revenue = 1000m)
        {
            // Setup dữ liệu tổng quan
            _mockItemRepo.Setup(r => r.CountAllBySellerAsync(It.IsAny<int>())).ReturnsAsync(listings);
            _mockOrderRepo.Setup(r => r.CountBySellerAsync(It.IsAny<int>())).ReturnsAsync(orders);
            _mockItemRepo.Setup(r => r.GetTotalItemsSoldBySellerAsync(It.IsAny<int>())).ReturnsAsync(sold);
            _mockPaymentDetailRepo.Setup(r => r.GetRevenueAsync(It.IsAny<int>())).ReturnsAsync(revenue);

            // Setup Product Statistics
            _mockItemRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), ItemStatus.Active.ToString())).ReturnsAsync(3);
            _mockItemRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), ItemStatus.Pending.ToString())).ReturnsAsync(2);
            _mockItemRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), ItemStatus.Rejected.ToString())).ReturnsAsync(1);

            // Setup Order Statistics
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), OrderStatus.Pending.ToString())).ReturnsAsync(4);
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), OrderStatus.Paid.ToString())).ReturnsAsync(3);
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), OrderStatus.Completed.ToString())).ReturnsAsync(10);
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), OrderStatus.Shipped.ToString())).ReturnsAsync(1);
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), OrderStatus.Cancelled.ToString())).ReturnsAsync(2);

            // Setup Weekly Data
            _mockPaymentDetailRepo.Setup(r => r.GetRevenueByWeekAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<RevenueByWeekDto> { new() { Year = 2025, WeekNumber = 1, Total = 500m } });
            _mockOrderRepo.Setup(r => r.GetOrdersByWeekAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<OrdersByWeekDto> { new() { Year = 2025, WeekNumber = 1, Total = 2 } });
        }

        // === HAPPY PATHS AND EDGE CASES (5 CASES) ===

        // 1. Happy Path: Trả về DTO hoàn chỉnh khi tất cả dữ liệu có sẵn.
        [Fact]
        public async Task TC_SELLER_01_GetDashboard_ValidId_ReturnsFullDto()
        {
            // Arrange
            SetupSuccessMocks(listings: 50, orders: 20, sold: 15, revenue: 15000m);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(50, result.Listings);
            Assert.Equal(20, result.Orders);
            Assert.Equal(15000m, result.Revenue);
            Assert.Equal(5, result.ProductStatistics.Featured);
        }

        // 2. Kiểm tra khi không có bất kỳ dữ liệu nào (tất cả đều bằng 0).
        [Fact]
        public async Task TC_SELLER_02_GetDashboard_ZeroData_ReturnsZeros()
        {
            // Arrange
            SetupSuccessMocks(listings: 0, orders: 0, sold: 0, revenue: 0m);
            _mockItemRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), It.IsAny<string>())).ReturnsAsync(0);
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(It.IsAny<int>(), It.IsAny<string>())).ReturnsAsync(0);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(0, result.Listings);
            Assert.Equal(0, result.Orders);
            Assert.Equal(0, result.ProductStatistics.Active);
            Assert.Equal(0, result.OrderStatistics.Completed);
        }

        // 3. Kiểm tra đầu vào SellerId không hợp lệ (nhỏ hơn hoặc bằng 0).
        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public async Task TC_SELLER_03_GetDashboard_InvalidSellerId_ThrowsArgumentException(int invalidId)
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _sellerService.GetSellerDashboardAsync(invalidId));
        }

        // 4. Kiểm tra khi RevenueByWeek trả về dữ liệu rỗng.
        [Fact]
        public async Task TC_SELLER_04_RevenueByWeek_EmptyData_ReturnsEmptyList()
        {
            // Arrange
            SetupSuccessMocks();
            _mockPaymentDetailRepo.Setup(r => r.GetRevenueByWeekAsync(SellerId)).ReturnsAsync(new List<RevenueByWeekDto>());

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Empty(result.RevenueByWeek);
        }

        // 5. Kiểm tra khi OrdersByWeek trả về dữ liệu rỗng.
        [Fact]
        public async Task TC_SELLER_05_OrdersByWeek_EmptyData_ReturnsEmptyList()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.GetOrdersByWeekAsync(SellerId)).ReturnsAsync(new List<OrdersByWeekDto>());

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Empty(result.OrdersByWeek);
        }

        // === PRODUCT & ITEM STATISTICS TESTS (5 CASES) ===

        // 6. Xác minh ProductStatistics.Active được tính đúng.
        [Fact]
        public async Task TC_SELLER_06_ProductStats_Active_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockItemRepo.Setup(r => r.CountByStatusAsync(SellerId, ItemStatus.Active.ToString())).ReturnsAsync(15);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(15, result.ProductStatistics.Active);
        }

        // 7. Xác minh ProductStatistics.Pending được tính đúng.
        [Fact]
        public async Task TC_SELLER_07_ProductStats_Pending_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockItemRepo.Setup(r => r.CountByStatusAsync(SellerId, ItemStatus.Pending.ToString())).ReturnsAsync(7);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(7, result.ProductStatistics.Pending);
        }

        // 8. Xác minh ProductStatistics.Inactive (Rejected) được tính đúng.
        [Fact]
        public async Task TC_SELLER_08_ProductStats_Inactive_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockItemRepo.Setup(r => r.CountByStatusAsync(SellerId, ItemStatus.Rejected.ToString())).ReturnsAsync(12);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(12, result.ProductStatistics.Inactive);
        }

        // 9. Xác minh tổng số sản phẩm bán được (Sold) được tính đúng.
        [Fact]
        public async Task TC_SELLER_09_TotalSold_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockItemRepo.Setup(r => r.GetTotalItemsSoldBySellerAsync(SellerId)).ReturnsAsync(50);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(50, result.Sold);
        }

        // 10. Xác minh tổng doanh thu (Revenue) được tính đúng.
        [Fact]
        public async Task TC_SELLER_10_TotalRevenue_ValueCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockPaymentDetailRepo.Setup(r => r.GetRevenueAsync(SellerId)).ReturnsAsync(99999.99m);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(99999.99m, result.Revenue);
        }

        // === ORDER STATISTICS TESTS (5 CASES) ===

        // 11. Xác minh OrderStatistics.New (Pending) được tính đúng.
        [Fact]
        public async Task TC_SELLER_11_OrderStats_New_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(SellerId, OrderStatus.Pending.ToString())).ReturnsAsync(14);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(14, result.OrderStatistics.New);
        }

        // 12. Xác minh OrderStatistics.Processing (Paid) được tính đúng.
        [Fact]
        public async Task TC_SELLER_12_OrderStats_Processing_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(SellerId, OrderStatus.Paid.ToString())).ReturnsAsync(25);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(25, result.OrderStatistics.Processing);
        }

        // 13. Xác minh OrderStatistics.Completed được tính đúng.
        [Fact]
        public async Task TC_SELLER_13_OrderStats_Completed_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(SellerId, OrderStatus.Completed.ToString())).ReturnsAsync(50);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(50, result.OrderStatistics.Completed);
        }

        // 14. Xác minh OrderStatistics.Shipped được tính đúng.
        [Fact]
        public async Task TC_SELLER_14_OrderStats_Shipped_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(SellerId, OrderStatus.Shipped.ToString())).ReturnsAsync(3);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(3, result.OrderStatistics.Shipped);
        }

        // 15. Xác minh OrderStatistics.Cancelled được tính đúng.
        [Fact]
        public async Task TC_SELLER_15_OrderStats_Cancelled_CountCorrect()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.CountByStatusAsync(SellerId, OrderStatus.Cancelled.ToString())).ReturnsAsync(0);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(0, result.OrderStatistics.Cancelled);
        }

        // === WEEKLY DATA INTEGRITY & EXCEPTION TESTS (5 CASES) ===

        // 16. Xác minh RevenueByWeek trả về chính xác nhiều dữ liệu.
        [Fact]
        public async Task TC_SELLER_16_RevenueByWeek_MultipleDataVerification()
        {
            // Arrange
            SetupSuccessMocks();
            var expected = new List<RevenueByWeekDto>
            {
                new() { Year = 2025, WeekNumber = 10, Total = 1000m },
                new() { Year = 2025, WeekNumber = 11, Total = 2500m }
            };
            _mockPaymentDetailRepo.Setup(r => r.GetRevenueByWeekAsync(SellerId)).ReturnsAsync(expected);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(2, result.RevenueByWeek.Count);
            Assert.Equal(2500m, result.RevenueByWeek.Last().Total);
        }

        // 17. Xác minh OrdersByWeek trả về chính xác nhiều dữ liệu.
        [Fact]
        public async Task TC_SELLER_17_OrdersByWeek_MultipleDataVerification()
        {
            // Arrange
            SetupSuccessMocks();
            var expected = new List<OrdersByWeekDto>
            {
                new() { Year = 2025, WeekNumber = 10, Total = 5 },
                new() { Year = 2025, WeekNumber = 11, Total = 10 }
            };
            _mockOrderRepo.Setup(r => r.GetOrdersByWeekAsync(SellerId)).ReturnsAsync(expected);

            // Act
            var result = await _sellerService.GetSellerDashboardAsync(SellerId);

            // Assert
            Assert.Equal(2, result.OrdersByWeek.Count);
            Assert.Equal(10, result.OrdersByWeek.Last().Total);
        }

        // 18. Kiểm tra khi CountAllBySellerAsync (Listings) ném ngoại lệ.
        [Fact]
        public async Task TC_SELLER_18_RepoFailure_ThrowsException_Listings()
        {
            // Arrange
            SetupSuccessMocks();
            _mockItemRepo.Setup(r => r.CountAllBySellerAsync(SellerId)).ThrowsAsync(new InvalidOperationException("DB Error"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _sellerService.GetSellerDashboardAsync(SellerId));
            Assert.Contains("Error while fetching seller dashboard data", ex.Message);
        }

        // 19. Kiểm tra khi GetRevenueAsync (Revenue) ném ngoại lệ.
        [Fact]
        public async Task TC_SELLER_19_RepoFailure_ThrowsException_Revenue()
        {
            // Arrange
            SetupSuccessMocks();
            _mockPaymentDetailRepo.Setup(r => r.GetRevenueAsync(SellerId)).ThrowsAsync(new InvalidOperationException("DB Error"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _sellerService.GetSellerDashboardAsync(SellerId));
            Assert.Contains("Error while fetching seller dashboard data", ex.Message);
        }

        // 20. Kiểm tra khi GetOrdersByWeekAsync trả về null (Repo trả về Null).
        [Fact]
        public async Task TC_SELLER_20_OrdersByWeek_NullData_ThrowsException()
        {
            // Arrange
            SetupSuccessMocks();
            _mockOrderRepo.Setup(r => r.GetOrdersByWeekAsync(SellerId)).ReturnsAsync((List<OrdersByWeekDto>)null);

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _sellerService.GetSellerDashboardAsync(SellerId));
        }
    }
}