//using Application.DTOs.ManageCompanyDtos;
//using Application.IRepositories;
//using Application.IRepositories.IPaymentRepositories;
//using Application.Services;
//using Domain.Common.Constants;
//using Domain.Entities;
//using Moq;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Xunit;

//namespace Application.Tests.Services
//{
//    public class ManagerDashboardServiceTests
//    {
//        private readonly Mock<IUnitOfWork> _mockUow;
//        private readonly Mock<IOrderRepository> _mockOrderRepo;
//        private readonly Mock<IUserRepository> _mockUserRepo;
//        private readonly Mock<IItemRepository> _mockItemRepo;
//        private readonly Mock<IPaymentRepository> _mockPaymentRepo;
//        private readonly Mock<ITransactionRepository> _mockTransactionRepo;
//        private readonly Mock<IKycDocumentRepository> _mockKycRepo;
//        private readonly ManagerDashboardService _managerService;

//        // Dữ liệu mẫu chung
//        private readonly int StaffId = 20;
//        private readonly int KycDocId = 30;
//        private readonly int KycUserId = 10;
//        private readonly int LatestTransactionLimit = 5;

//        public ManagerDashboardServiceTests()
//        {
//            // --- Setup Mocks ---
//            _mockUow = new Mock<IUnitOfWork>();
//            _mockOrderRepo = new Mock<IOrderRepository>();
//            _mockUserRepo = new Mock<IUserRepository>();
//            _mockItemRepo = new Mock<IItemRepository>();
//            _mockPaymentRepo = new Mock<IPaymentRepository>();
//            _mockTransactionRepo = new Mock<ITransactionRepository>();
//            _mockKycRepo = new Mock<IKycDocumentRepository>();

//            _mockUow.SetupGet(u => u.Orders).Returns(_mockOrderRepo.Object);
//            _mockUow.SetupGet(u => u.Users).Returns(_mockUserRepo.Object);
//            _mockUow.SetupGet(u => u.Items).Returns(_mockItemRepo.Object);
//            _mockUow.SetupGet(u => u.Payments).Returns(_mockPaymentRepo.Object);
//            _mockUow.SetupGet(u => u.Transactions).Returns(_mockTransactionRepo.Object);
//            _mockUow.SetupGet(u => u.KycDocuments).Returns(_mockKycRepo.Object);

//            // Note: Cần mock IComplaintRepository nếu nó được sử dụng, 
//            // nhưng chỉ cần IUnitOfWork trong constructor này.
//            _managerService = new ManagerDashboardService(null!, _mockUow.Object);
//        }

//        // Helper cho KYC
//        private KycDocument MockKyc(int id, string status, int userId = 10) => new KycDocument { DocId = id, UserId = userId, Status = status };

//        // Phương thức Setup chung để tạo dữ liệu thành công mặc định
//        private void SetupSuccessMocks(decimal revenue = 5000m, int totalUsers = 100, int activeListings = 50, double growth = 10.5)
//        {
//            // Setup Metrics
//            _mockOrderRepo.Setup(r => r.GetRevenueThisMonthAsync(It.IsAny<DateTime>())).ReturnsAsync(revenue);
//            _mockUserRepo.Setup(r => r.CountAsync()).ReturnsAsync(totalUsers);
//            _mockItemRepo.Setup(r => r.CountActiveAsync()).ReturnsAsync(activeListings);
//            _mockUserRepo.Setup(r => r.GetMonthlyGrowthAsync()).ReturnsAsync(growth);

//            // Setup Data for aggregation methods (default)
//            _mockPaymentRepo.Setup(r => r.GetRevenueByMonthAsync(It.IsAny<int>()))
//                .ReturnsAsync(new List<(int, int, decimal)> { (2025, 1, 1000m) });
//            _mockOrderRepo.Setup(r => r.GetOrdersWithinRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
//                .ReturnsAsync(new List<Order> { new() { CreatedAt = DateTime.Now.AddDays(-1), Status = OrderItemStatus.Completed.ToString() } });
//            _mockItemRepo.Setup(r => r.GetItemTypeCountsAsync())
//                .ReturnsAsync(new List<(string, int)> { ("Ev", 20), ("Battery", 80) });
//            _mockTransactionRepo.Setup(r => r.GetLatestTransactionsAsync(It.IsAny<int>()))
//                .ReturnsAsync(new List<LatestTransactionDto> { new() { PaymentId = 1 } });
//            _mockKycRepo.Setup(r => r.GetPendingApprovalsAsync())
//                .ReturnsAsync(new List<SellerPendingApprovalDto> { new() { Id = KycDocId } });

//            // Setup for KYC Approval/Rejection (default user)
//            _mockUserRepo.Setup(r => r.GetByIdAsync(KycUserId)).ReturnsAsync(new User { UserId = KycUserId, KycStatus = KycStatus.Pending.ToString() });
//            _mockKycRepo.Setup(r => r.UpdateAsync(It.IsAny<KycDocument>())).Returns(Task.CompletedTask);
//            _mockUserRepo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
//        }

//        // === METRICS & TOP-LEVEL DATA TESTS (6 CASES) ===

//        // 1. Happy Path: Trả về đầy đủ các chỉ số khi mọi thứ thành công.
//        [Fact]
//        public async Task TC_MANAGER_01_GetMetrics_Success_ReturnsFullData()
//        {
//            // Arrange
//            SetupSuccessMocks(revenue: 8888.88m, totalUsers: 500, activeListings: 150, growth: 15.0);

//            // Act
//            var result = await _managerService.GetMetricsAsync();

//            // Assert
//            Assert.Equal(8888.88m, result.RevenueThisMonth);
//            Assert.Equal(500, result.TotalUsers);
//            Assert.Equal(150, result.ActiveListings);
//            Assert.Equal(15.0, result.Growth);
//        }

//        // 2. Kiểm tra khi không có dữ liệu (tất cả bằng 0).
//        [Fact]
//        public async Task TC_MANAGER_02_GetMetrics_ZeroData_ReturnsZeros()
//        {
//            // Arrange
//            SetupSuccessMocks(revenue: 0m, totalUsers: 0, activeListings: 0, growth: 0.0);

//            // Act
//            var result = await _managerService.GetMetricsAsync();

//            // Assert
//            Assert.Equal(0m, result.RevenueThisMonth);
//            Assert.Equal(0, result.TotalUsers);
//            Assert.Equal(0, result.ActiveListings);
//        }

//        // 3. Kiểm tra khi GetMonthlyGrowthAsync trả về giá trị âm (suy giảm).
//        [Fact]
//        public async Task TC_MANAGER_03_GetMetrics_NegativeGrowth_ValueCorrect()
//        {
//            // Arrange
//            SetupSuccessMocks(growth: -5.75);

//            // Act
//            var result = await _managerService.GetMetricsAsync();

//            // Assert
//            Assert.Equal(-5.75, result.Growth);
//        }

//        // 4. Kiểm tra khi GetRevenueThisMonthAsync ném ngoại lệ (Exception Handling).
//        [Fact]
//        public async Task TC_MANAGER_04_GetMetrics_RepoFailure_ThrowsException()
//        {
//            // Arrange
//            _mockOrderRepo.Setup(r => r.GetRevenueThisMonthAsync(It.IsAny<DateTime>())).ThrowsAsync(new Exception("DB Error"));

//            // Act & Assert
//            await Assert.ThrowsAsync<Exception>(() => _managerService.GetMetricsAsync());
//        }

//        // 5. Happy Path: Lấy giao dịch mới nhất (Giới hạn 5).
//        [Fact]
//        public async Task TC_MANAGER_05_GetLatestTransactions_ReturnsLimitedList()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var transactions = Enumerable.Range(1, 5).Select(i => new LatestTransactionDto { PaymentId = i }).ToList();
//            _mockTransactionRepo.Setup(r => r.GetLatestTransactionsAsync(LatestTransactionLimit)).ReturnsAsync(transactions);

//            // Act
//            var result = await _managerService.GetLatestTransactionsAsync(LatestTransactionLimit);

//            // Assert
//            Assert.Equal(LatestTransactionLimit, result.Count);
//            _mockTransactionRepo.Verify(r => r.GetLatestTransactionsAsync(LatestTransactionLimit), Times.Once);
//        }

//        // 6. Kiểm tra khi Repository giao dịch trả về null (Exception Handling).
//        [Fact]
//        public async Task TC_MANAGER_06_GetLatestTransactions_RepoReturnsNull_ThrowsException()
//        {
//            // Arrange
//            _mockTransactionRepo.Setup(r => r.GetLatestTransactionsAsync(It.IsAny<int>())).ReturnsAsync((List<LatestTransactionDto>)null);

//            // Act & Assert
//            var ex = await Assert.ThrowsAsync<Exception>(() => _managerService.GetLatestTransactionsAsync(10));
//            Assert.Equal("Failed to fetch latest transactions.", ex.Message);
//        }

//        // === REVENUE & ORDERS BY MONTH TESTS (5 CASES) ===

//        // 7. GetRevenueByMonth: Mặc định gọi lấy dữ liệu 12 tháng.
//        [Fact]
//        public async Task TC_MANAGER_07_GetRevenueByMonth_DefaultRange_Calls12Months()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            // Mocks trả về 1 tháng để kiểm tra tính đúng đắn của logic
//            var data = new List<(int, int, decimal)> { (DateTime.Now.Year, DateTime.Now.Month, 100m) };
//            _mockPaymentRepo.Setup(r => r.GetRevenueByMonthAsync(12)).ReturnsAsync(data);

//            // Act
//            await _managerService.GetRevenueByMonthAsync("12m");

//            // Assert
//            _mockPaymentRepo.Verify(r => r.GetRevenueByMonthAsync(12), Times.Once);
//        }

//        // 8. GetRevenueByMonth: Kiểm tra khi truyền range tùy chỉnh ("3m").
//        [Fact]
//        public async Task TC_MANAGER_08_GetRevenueByMonth_CustomRange_CallsCorrectly()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            _mockPaymentRepo.Setup(r => r.GetRevenueByMonthAsync(3)).ReturnsAsync(new List<(int, int, decimal)>());

//            // Act
//            await _managerService.GetRevenueByMonthAsync("3m");

//            // Assert
//            _mockPaymentRepo.Verify(r => r.GetRevenueByMonthAsync(3), Times.Once);
//        }

//        // 9. GetRevenueByMonth: Kiểm tra ánh xạ DTO (từ số tháng sang tên).
//        [Fact]
//        public async Task TC_MANAGER_09_GetRevenueByMonth_DataMapping_MonthNameCorrect()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            // Tháng 1 (January)
//            var revenueData = new List<(int, int, decimal)> { (2025, 1, 100m) };
//            _mockPaymentRepo.Setup(r => r.GetRevenueByMonthAsync(It.IsAny<int>())).ReturnsAsync(revenueData);

//            // Act
//            var result = await _managerService.GetRevenueByMonthAsync("1m");

//            // Assert
//            Assert.Equal("Jan", result.First().Month);
//        }

//        // 10. GetOrdersByMonth: Happy Path - Trả về OrdersByMonthDto với dữ liệu.
//        [Fact]
//        public async Task TC_MANAGER_10_GetOrdersByMonth_Success_ReturnsGroupedData()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var orders = new List<Order>
//            {
//                new() { CreatedAt = DateTime.Now.AddDays(-10), Status = OrderItemStatus.Completed.ToString() },
//                new() { CreatedAt = DateTime.Now.AddDays(-15), Status = OrderItemStatus.Completed.ToString() }
//            };
//            _mockOrderRepo.Setup(r => r.GetOrdersWithinRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>())).ReturnsAsync(orders);

//            // Act
//            var result = await _managerService.GetOrdersByMonthAsync(1);

//            // Assert
//            Assert.Single(result);
//            Assert.Equal(2, result.First().TotalOrders);
//        }

//        // 11. GetOrdersByMonth: Kiểm tra việc điền các tháng không có đơn hàng (TotalOrders = 0).
//        [Fact]
//        public async Task TC_MANAGER_11_GetOrdersByMonth_FillsMissingMonths()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var now = DateTime.Now;
//            // Chỉ có đơn hàng trong tháng trước
//            var orders = new List<Order>
//            {
//                new() { CreatedAt = now.AddMonths(-1), Status = OrderItemStatus.Completed.ToString() }
//            };
//            _mockOrderRepo.Setup(r => r.GetOrdersWithinRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>())).ReturnsAsync(orders);

//            // Act
//            var result = (await _managerService.GetOrdersByMonthAsync(2)).ToList();

//            // Assert
//            Assert.Equal(2, result.Count);
//            // Tháng trước (Month - 1)
//            Assert.Equal(1, result.First(o => o.Month == now.AddMonths(-1).ToString("MMM")).TotalOrders);
//            // Tháng hiện tại (Month 0)
//            Assert.Equal(0, result.First(o => o.Month == now.ToString("MMM")).TotalOrders);
//        }

//        // === PRODUCT DISTRIBUTION TESTS (3 CASES) ===

//        // 12. Happy Path: Tính toán tỷ lệ phần trăm chính xác (25 EV, 75 Battery).
//        [Fact]
//        public async Task TC_MANAGER_12_GetProductDistribution_CalculatesPercentagesCorrectly()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var itemTypeCounts = new List<(string, int)> { ("Ev", 25), ("Battery", 75) };
//            _mockItemRepo.Setup(r => r.GetItemTypeCountsAsync()).ReturnsAsync(itemTypeCounts);

//            // Act
//            var result = (await _managerService.GetProductDistributionAsync()).ToList();

//            // Assert
//            Assert.Equal(2, result.Count);
//            Assert.Equal(25, result.First(d => d.Name == "Ev").Value);
//            Assert.Equal(75, result.First(d => d.Name == "Battery").Value);
//        }

//        // 13. Kiểm tra khi tổng số sản phẩm là 0.
//        [Fact]
//        public async Task TC_MANAGER_13_GetProductDistribution_NoProducts_ReturnsZeros()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var itemTypeCounts = new List<(string, int)> { ("Ev", 0), ("Battery", 0) };
//            _mockItemRepo.Setup(r => r.GetItemTypeCountsAsync()).ReturnsAsync(itemTypeCounts);

//            // Act
//            var result = (await _managerService.GetProductDistributionAsync()).ToList();

//            // Assert
//            Assert.True(result.All(d => d.Value == 0));
//        }

//        // 14. Kiểm tra khi Repository Product Distribution trả về null (Exception Handling).
//        [Fact]
//        public async Task TC_MANAGER_14_GetProductDistribution_RepoReturnsNull_ThrowsException()
//        {
//            // Arrange
//            _mockItemRepo.Setup(r => r.GetItemTypeCountsAsync()).ReturnsAsync((IEnumerable<(string, int)>)null);

//            // Act & Assert
//            var ex = await Assert.ThrowsAsync<Exception>(() => _managerService.GetProductDistributionAsync());
//            Assert.Equal("Failed to fetch product distribution data.", ex.Message);
//        }

//        // === PENDING APPROVALS & KYC TESTS (6 CASES) ===

//        // 15. Happy Path: Lấy danh sách KYC đang chờ duyệt.
//        [Fact]
//        public async Task TC_MANAGER_15_GetPendingApprovals_Success_ReturnsList()
//        {
//            // Arrange
//            SetupSuccessMocks();

//            // Act
//            var result = await _managerService.GetPendingApprovalsAsync();

//            // Assert
//            Assert.Single(result);
//            Assert.Equal(KycDocId, result.First().Id);
//        }

//        // 16. ApproveAsync: Happy Path - Duyệt KYC thành công.
//        [Fact]
//        public async Task TC_MANAGER_16_ApproveAsync_ValidKyc_UpdatesStatusAndRole()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var kyc = MockKyc(KycDocId, KycStatus.Pending.ToString(), KycUserId);
//            _mockKycRepo.Setup(r => r.GetKycByIdAsync(KycDocId)).ReturnsAsync(kyc);

//            // Act
//            await _managerService.ApproveAsync(KycDocId, StaffId);

//            // Assert
//            // 1. Cập nhật trạng thái KYC
//            _mockKycRepo.Verify(r => r.UpdateAsync(It.Is<KycDocument>(d => d.Status == KycStatus.Approved.ToString() && d.VerifiedBy == StaffId)), Times.Once);
//            // 2. Cập nhật Role và trạng thái KYC của User
//            _mockUserRepo.Verify(r => r.UpdateAsync(It.Is<User>(u => u.Role == UserRole.Seller.ToString() && u.KycStatus == KycStatus.Approved.ToString())), Times.Once);
//            _mockUserRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
//        }

//        // 17. ApproveAsync: KYC không tồn tại.
//        [Fact]
//        public async Task TC_MANAGER_17_ApproveAsync_KycNotFound_ThrowsKeyNotFoundException()
//        {
//            // Arrange
//            _mockKycRepo.Setup(r => r.GetKycByIdAsync(KycDocId)).ReturnsAsync((KycDocument)null);

//            // Act & Assert
//            await Assert.ThrowsAsync<KeyNotFoundException>(() => _managerService.ApproveAsync(KycDocId, StaffId));
//        }

//        // 18. ApproveAsync: KYC đã được xử lý (Approved) -> ném InvalidOperationException.
//        [Fact]
//        public async Task TC_MANAGER_18_ApproveAsync_AlreadyApproved_ThrowsInvalidOperationException()
//        {
//            // Arrange
//            var kyc = MockKyc(KycDocId, KycStatus.Approved.ToString());
//            _mockKycRepo.Setup(r => r.GetKycByIdAsync(KycDocId)).ReturnsAsync(kyc);

//            // Act & Assert
//            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _managerService.ApproveAsync(KycDocId, StaffId));
//            Assert.Contains("Document already processed.", ex.Message);
//        }

//        // 19. RejectAsync: Happy Path - Từ chối KYC với ghi chú.
//        [Fact]
//        public async Task TC_MANAGER_19_RejectAsync_ValidKyc_UpdatesStatusAndNote()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var kyc = MockKyc(KycDocId, KycStatus.Pending.ToString(), KycUserId);
//            _mockKycRepo.Setup(r => r.GetKycByIdAsync(KycDocId)).ReturnsAsync(kyc);

//            // Act
//            await _managerService.RejectAsync(KycDocId, StaffId, "Invalid documents reason.");

//            // Assert
//            // 1. Cập nhật trạng thái và ghi chú KYC
//            _mockKycRepo.Verify(r => r.UpdateAsync(It.Is<KycDocument>(d => d.Status == KycStatus.Rejected.ToString() && d.Note == "Invalid documents reason.")), Times.Once);
//            // 2. Cập nhật trạng thái KYC của User
//            _mockUserRepo.Verify(r => r.UpdateAsync(It.Is<User>(u => u.KycStatus == KycStatus.Rejected.ToString())), Times.Once);
//            _mockUserRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
//        }

//        // 20. RejectAsync: User liên quan không tồn tại (orphan record).
//        [Fact]
//        public async Task TC_MANAGER_20_RejectAsync_UserNotFound_ThrowsException()
//        {
//            // Arrange
//            SetupSuccessMocks();
//            var kyc = MockKyc(KycDocId, KycStatus.Pending.ToString(), 999); // UserId 999
//            _mockKycRepo.Setup(r => r.GetKycByIdAsync(KycDocId)).ReturnsAsync(kyc);
//            _mockUserRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User)null); // User not found

//            // Act & Assert
//            var ex = await Assert.ThrowsAsync<Exception>(() => _managerService.RejectAsync(KycDocId, StaffId, "Note"));
//            Assert.Equal("Associated user not found for KYC document.", ex.Message);
//        }
//    }
//}