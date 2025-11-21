using Application.DTOs;
using Application.IRepositories;
using Application.Services;
using Domain.Common.Constants;
using Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class KycDocumentServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IKycDocumentRepository> _mockRepo;
        private readonly KycDocumentService _service;

        public KycDocumentServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockRepo = new Mock<IKycDocumentRepository>();
            _mockUow.Setup(u => u.KycDocuments).Returns(_mockRepo.Object);

            _service = new KycDocumentService(null!, _mockUow.Object);
        }

        private User MockUser(int id, string status = "Active") => new User
        {
            UserId = id,
            AccountStatus = status
        };

        private KycDocument MockKyc(int id, int userId, string status = "Pending") => new KycDocument
        {
            DocId = id,
            UserId = userId,
            Status = status
        };

        #region Ban/Activate/Warning

        [Fact]
        public async Task BanUserAsync_ShouldThrow_WhenUserNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.BanUserAsync(1));
        }

        [Fact]
        public async Task BanUserAsync_ShouldThrow_WhenAlreadyBanned()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(MockUser(1, "Ban"));
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.BanUserAsync(1));
        }

        [Fact]
        public async Task BanUserAsync_ShouldCallUpdate_WhenValid()
        {
            var user = MockUser(1, "Active");
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

            await _service.BanUserAsync(1);

            _mockRepo.Verify(r => r.UpdateAccountStatusAsync(1, "Ban"), Times.Once);
        }

        [Fact]
        public async Task ActivateUserAsync_ShouldThrow_WhenUserNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.ActivateUserAsync(2));
        }

        [Fact]
        public async Task ActivateUserAsync_ShouldThrow_WhenAlreadyActive()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(MockUser(2, "Active"));
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.ActivateUserAsync(2));
        }

        [Fact]
        public async Task ActivateUserAsync_ShouldCallUpdate_WhenValid()
        {
            var user = MockUser(2, "Ban");
            _mockRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(user);

            await _service.ActivateUserAsync(2);

            _mockRepo.Verify(r => r.UpdateAccountStatusAsync(2, "Active"), Times.Once);
        }

        [Fact]
        public async Task WarningUserAsync_ShouldThrow_WhenUserNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.WarningUserAsync(3));
        }

        [Fact]
        public async Task WarningUserAsync_ShouldThrow_WhenUserBanned()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(MockUser(3, "Ban"));
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.WarningUserAsync(3));
        }

        [Fact]
        public async Task WarningUserAsync_ShouldMoveFromWarning1ToWarning2()
        {
            var user = MockUser(3, "Warning1");
            _mockRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(user);

            await _service.WarningUserAsync(3);

            _mockRepo.Verify(r => r.UpdateAccountStatusAsync(3, "Warning2"), Times.Once);
        }

        [Fact]
        public async Task WarningUserAsync_ShouldMoveFromWarning2ToBan()
        {
            var user = MockUser(3, "Warning2");
            _mockRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(user);

            await _service.WarningUserAsync(3);

            _mockRepo.Verify(r => r.UpdateAccountStatusAsync(3, "Ban"), Times.Once);
        }

        [Fact]
        public async Task WarningUserAsync_ShouldMoveFromOtherToWarning1()
        {
            var user = MockUser(3, "Active");
            _mockRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(user);

            await _service.WarningUserAsync(3);

            _mockRepo.Verify(r => r.UpdateAccountStatusAsync(3, "Warning1"), Times.Once);
        }

        #endregion

        #region Approve/Reject KYC

        [Fact]
        public async Task ApproveKycAsync_ShouldThrow_WhenKycNotFound()
        {
            _mockRepo.Setup(r => r.GetKYC_DocumentByIdAsync(1)).ReturnsAsync((KycDocument?)null);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.ApproveKycAsync(1, new ApproveKycDocumentDto()));
        }

        [Fact]
        public async Task ApproveKycAsync_ShouldThrow_WhenUserNotFound()
        {
            var kyc = MockKyc(1, 5);
            _mockRepo.Setup(r => r.GetKYC_DocumentByIdAsync(1)).ReturnsAsync(kyc);
            _mockRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((User?)null);

            await Assert.ThrowsAsync<ArgumentException>(() => _service.ApproveKycAsync(1, new ApproveKycDocumentDto()));
        }


        #endregion

        #region GetPending/Approved/Rejected

        [Fact]
        public async Task GetPendingKycAsync_ShouldCallRepo()
        {
            _mockRepo.Setup(r => r.GetKYC_DocumentsByStatusAsync("Pending")).ReturnsAsync(new List<KycDocument>());
            var result = await _service.GetPendingKycAsync();
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetApprovedKycAsync_ShouldCallRepo()
        {
            _mockRepo.Setup(r => r.GetKYC_DocumentsByStatusAsync("Approved")).ReturnsAsync(new List<KycDocument>());
            var result = await _service.GetApprovedKycAsync();
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetRejectedKycAsync_ShouldCallRepo()
        {
            _mockRepo.Setup(r => r.GetKYC_DocumentsByStatusAsync("Rejected")).ReturnsAsync(new List<KycDocument>());
            var result = await _service.GetRejectedKycAsync();
            Assert.Empty(result);
        }

        #endregion

        #region CreateKycDocument

        [Fact]
        public async Task CreateKycDocumentAsync_ShouldThrow_WhenUserNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateKycDocumentAsync(new KycDocument(), 5));
        }

        [Fact]
        public async Task CreateKycDocumentAsync_ShouldCallRepo_WhenValid()
        {
            var user = MockUser(5);
            var kyc = new KycDocument();
            _mockRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(user);

            await _service.CreateKycDocumentAsync(kyc, 5);

            _mockRepo.Verify(r => r.CreateKYC_DocumentAsync(kyc), Times.Once);
            _mockRepo.Verify(r => r.SetUserKYCStatusAsync(5, "Pending", "Seller"), Times.Once);
        }

        #endregion
    }
}
