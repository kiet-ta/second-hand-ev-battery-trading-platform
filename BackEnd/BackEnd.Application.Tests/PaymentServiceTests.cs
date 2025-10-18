using Application.DTOs.PaymentDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using Net.payOS;
using Net.payOS.Types;

namespace BackEnd.Application.Tests;

public class PaymentServiceTests
{
    private readonly Mock<PayOS> _payOSMock;
    private readonly Mock<IPaymentRepository> _paymentRepositoryMock;
    private readonly Mock<IWalletRepository> _walletRepositoryMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ICommissionFeeRuleRepository> _commissionRuleRepoMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly IPaymentService _paymentService;

    public PaymentServiceTests()
    {
        _payOSMock = new Mock<PayOS>("client_id", "api_key", "checksum_key");
        _paymentRepositoryMock = new Mock<IPaymentRepository>();
        _walletRepositoryMock = new Mock<IWalletRepository>();
        _configMock = new Mock<IConfiguration>();
        _commissionRuleRepoMock = new Mock<ICommissionFeeRuleRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _itemRepositoryMock = new Mock<IItemRepository>();

        // Mock IConfiguration
        _configMock.Setup(config => config["AppSettings:Domain"]).Returns("http://localhost:5173/");

        _paymentService = new PaymentService(
            _payOSMock.Object,
            _paymentRepositoryMock.Object,
            _walletRepositoryMock.Object,
            _configMock.Object,
            _commissionRuleRepoMock.Object,
            _userRepositoryMock.Object,
            _itemRepositoryMock.Object
        );
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldThrowException_WhenTotalAmountMismatches()
    {
        // Arrange
        var request = new PaymentRequestDto
        {
            TotalAmount = 1000,
            Details = new List<PaymentDetailDto> { new PaymentDetailDto { Amount = 400 } }
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _paymentService.CreatePaymentAsync(request));
        Assert.Equal("Total amount does not match details", exception.Message);
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldThrowException_WhenWalletIsInsufficient()
    {
        // Arrange
        var request = new PaymentRequestDto
        {
            UserId = 1,
            Method = "wallet",
            TotalAmount = 1000,
            Details = new List<PaymentDetailDto> { new PaymentDetailDto { Amount = 1000 } }
        };
        var wallet = new Wallet { UserId = 1, Balance = 500 };

        _paymentRepositoryMock.Setup(r => r.GetWalletByUserIdAsync(request.UserId)).ReturnsAsync(wallet);
        _paymentRepositoryMock.Setup(r => r.AddPaymentAsync(It.IsAny<Payment>())).ReturnsAsync(new Payment { PaymentId = 1 });

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _paymentService.CreatePaymentAsync(request));
        Assert.Equal("Insufficient wallet balance", exception.Message);
    }

    [Fact]
    public async Task CreatePaymentAsync_ShouldSucceed_ForWalletPaymentWithSufficientBalance()
    {
        // Arrange
        var request = new PaymentRequestDto
        {
            UserId = 1,
            Method = "wallet",
            TotalAmount = 1000,
            Details = new List<PaymentDetailDto> { new PaymentDetailDto { Amount = 1000 } }
        };
        var wallet = new Wallet { UserId = 1, Balance = 1500 };

        _paymentRepositoryMock.Setup(r => r.GetWalletByUserIdAsync(request.UserId)).ReturnsAsync(wallet);
        _paymentRepositoryMock.Setup(r => r.AddPaymentAsync(It.IsAny<Payment>())).ReturnsAsync(new Payment { PaymentId = 1 });

        // Act
        var result = await _paymentService.CreatePaymentAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("completed", result.Status);
        _paymentRepositoryMock.Verify(r => r.DeductWalletBalanceAsync(wallet, request.TotalAmount, 1), Times.Once);
        _paymentRepositoryMock.Verify(r => r.UpdatePaymentStatusAsync(1, "completed"), Times.Once);
    }

    //[Fact]
    //public async Task CreatePaymentAsync_ShouldCreatePayOSLink_ForPayOSMethod()
    //{
    //    // Arrange
    //    var request = new PaymentRequestDto
    //    {
    //        UserId = 1,
    //        Method = "payos",
    //        TotalAmount = 2000,
    //        Details = new List<PaymentDetailDto> { new PaymentDetailDto { Amount = 2000, ItemId = 101 } }
    //    };
    //    var wallet = new Wallet { UserId = 1 };
    //    var payosResponse = new CreatePaymentLinkResult("00", "Success", null, "https://checkout.url", "qr.code", 123);

    //    _paymentRepositoryMock.Setup(r => r.GetWalletByUserIdAsync(request.UserId)).ReturnsAsync(wallet);
    //    _paymentRepositoryMock.Setup(r => r.AddPaymentAsync(It.IsAny<Payment>())).ReturnsAsync(new Payment { PaymentId = 2 });
    //    _payOSMock.Setup(p => p.createPaymentLink(It.IsAny<PaymentData>())).ReturnsAsync(payosResponse);

    //    // Act
    //    var result = await _paymentService.CreatePaymentAsync(request);

    //    // Assert
    //    Assert.NotNull(result);
    //    Assert.Equal("pending", result.Status);
    //    Assert.Equal("https://checkout.url", result.CheckoutUrl);
    //}

    //[Fact]
    //public async Task HandleWebhookAsync_ShouldUpdateUserPaidStatus_ForRegistrationPayment()
    //{
    //    // Arrange
    //    var orderCode = 12345L;
    //    var userId = 1;
    //    var webhookBody = new WebhookType { code = "00", desc = "success", data = new WebhookData { orderCode = orderCode } };
    //    _payOSMock.Setup(p => p.verifyPaymentWebhookData(webhookBody)).Returns(webhookBody.data);

    //    var paymentInfo = new PaymentInfoDto
    //    {
    //        PaymentId = 1,
    //        UserId = userId,
    //        Status = "pending",
    //        Details = new List<PaymentDetailDto> { new PaymentDetailDto { ItemId = null, OrderId = null, Amount = 500000 } }
    //    };
    //    _paymentRepositoryMock.Setup(r => r.GetPaymentInfoByOrderCodeAsync(orderCode)).ReturnsAsync(paymentInfo);

    //    var user = new User { UserId = userId, Paid = "pending" };
    //    _userRepositoryMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

    //    // Act
    //    await _paymentService.HandleWebhookAsync(webhookBody);

    //    // Assert
    //    _paymentRepositoryMock.Verify(r => r.UpdatePaymentStatusAsync(paymentInfo.PaymentId, "completed"), Times.Once);
    //    _userRepositoryMock.Verify(r => r.UpdateAsync(It.Is<User>(u => u.Paid == "registing")), Times.Once);
    //}
}