using Application.DTOs;
using Application.IRepositories;
using Application.Services;
using Microsoft.Extensions.Options;
using Moq;

namespace BackEnd.Application.Tests
{
    public class MailServiceTest
    {
        private readonly Mock<IOptions<MailSettings>> _mailSettingsMock;
        private readonly Mock<IEmailRepository> _emailRepoMock;
        private readonly MailSettings _mailSettings;

        public MailServiceTest()
        {
            _mailSettingsMock = new Mock<IOptions<MailSettings>>();
            _emailRepoMock = new Mock<IEmailRepository>();

            _mailSettings = new MailSettings
            {
                SenderEmail = "noreply@cocmuaxe.com",
                SenderName = "Coc Mua Xe",
                SenderPassword = "test-password",
                SmtpServer = "smtp.test.com",
                Port = 587
            };

            _mailSettingsMock.Setup(m => m.Value).Returns(_mailSettings);
        }

        [Fact]
        public async Task SendWelcomeMailAsync_ShouldCallRepository_WithCorrectParameters()
        {
            // Arrange
            var request = new WelcomeDto { To = "newuser@example.com" };
            var url = "https://example.com/welcome";
            var expectedTemplate = "<html>Welcome template</html>";

            _emailRepoMock
                .Setup(r => r.GetWelcomeTemplate(request.To, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert - Service will throw because SmtpClient cannot connect in test environment
            // We're verifying the repository is called with correct parameters
            try
            {
                await service.SendWelcomeMailAsync(request, url);
            }
            catch
            {
                // Expected to fail at SMTP level in test
            }

            _emailRepoMock.Verify(r => r.GetWelcomeTemplate(request.To, url), Times.Once);
        }

        [Fact]
        public async Task SendBanMailAsync_ShouldCallRepository_WithCorrectParameters()
        {
            // Arrange
            var request = new BanDto { To = "banned@example.com" };
            var reason = "Violation of terms";
            var url = "https://example.com/appeal";
            var expectedTemplate = "<html>Ban template</html>";

            _emailRepoMock
                .Setup(r => r.GetBanTemplate(request.To, reason, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendBanMailAsync(request, reason, url);
            }
            catch
            {
                // Expected to fail at SMTP level in test
            }

            _emailRepoMock.Verify(r => r.GetBanTemplate(request.To, reason, url), Times.Once);
        }

        [Fact]
        public async Task SendPurchaseSuccessMailAsync_ShouldCallRepository_WithCorrectParameters()
        {
            // Arrange
            var request = new PurchaseSuccessDto { To = "buyer@example.com" };
            var orderId = "ORD-12345";
            var url = "https://example.com/order/ORD-12345";
            var expectedTemplate = "<html>Purchase success template</html>";

            _emailRepoMock
                .Setup(r => r.GetPurchaseSuccessTemplate(request.To, orderId, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendPurchaseSuccessMailAsync(request, orderId, url);
            }
            catch
            {
                // Expected to fail at SMTP level in test
            }

            _emailRepoMock.Verify(r => r.GetPurchaseSuccessTemplate(request.To, orderId, url), Times.Once);
        }

        [Fact]
        public async Task SendPurchaseFailedMailAsync_ShouldCallRepository_WithCorrectParameters()
        {
            // Arrange
            var request = new PurchaseFailedDto { To = "buyer@example.com" };
            var orderId = "ORD-12345";
            var reason = "Payment declined";
            var url = "https://example.com/order/ORD-12345/retry";
            var expectedTemplate = "<html>Purchase failed template</html>";

            _emailRepoMock
                .Setup(r => r.GetPurchaseFailedTemplate(request.To, orderId, reason, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendPurchaseFailedMailAsync(request, orderId, reason, url);
            }
            catch
            {
                // Expected to fail at SMTP level in test
            }

            _emailRepoMock.Verify(r => r.GetPurchaseFailedTemplate(request.To, orderId, reason, url), Times.Once);
        }

        [Fact]
        public async Task SendNewStaffMailAsync_ShouldCallRepository_WithCorrectParameters()
        {
            // Arrange
            var request = new NewStaffTemplateDto
            {
                To = "newstaff@example.com",
                Password = "TempPass123!",
                ActionUrl = "https://example.com/staff/login"
            };
            var logoUrl = "https://example.com/logo.png";
            var expectedTemplate = "<html>New staff template</html>";

            _emailRepoMock
                .Setup(r => r.GetNewStaffTemplateAsync(request.To, request.Password, request.ActionUrl, logoUrl))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendNewStaffMailAsync(request, logoUrl);
            }
            catch
            {
                // Expected to fail at SMTP level in test
            }

            _emailRepoMock.Verify(r => r.GetNewStaffTemplateAsync(request.To, request.Password, request.ActionUrl, logoUrl), Times.Once);
        }

        [Fact]
        public async Task SendWelcomeMailAsync_ShouldHandleEmptyUrl()
        {
            // Arrange
            var request = new WelcomeDto { To = "user@example.com" };
            var url = "";
            var expectedTemplate = "<html>Welcome</html>";

            _emailRepoMock
                .Setup(r => r.GetWelcomeTemplate(request.To, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendWelcomeMailAsync(request, url);
            }
            catch
            {
                // Expected to fail at SMTP level
            }

            _emailRepoMock.Verify(r => r.GetWelcomeTemplate(request.To, url), Times.Once);
        }

        [Fact]
        public async Task SendBanMailAsync_ShouldHandleMultipleReasons()
        {
            // Arrange
            var request = new BanDto { To = "user@example.com" };
            var reason = "Multiple violations: spam, harassment, fraud";
            var url = "https://example.com/appeal";
            var expectedTemplate = "<html>Ban template</html>";

            _emailRepoMock
                .Setup(r => r.GetBanTemplate(request.To, reason, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendBanMailAsync(request, reason, url);
            }
            catch
            {
                // Expected
            }

            _emailRepoMock.Verify(r => r.GetBanTemplate(request.To, reason, url), Times.Once);
        }

        [Fact]
        public async Task SendPurchaseSuccessMailAsync_ShouldHandleOrderIdWithSpecialCharacters()
        {
            // Arrange
            var request = new PurchaseSuccessDto { To = "buyer@example.com" };
            var orderId = "ORD-2024-01-15-ABC123";
            var url = "https://example.com/order";
            var expectedTemplate = "<html>Success</html>";

            _emailRepoMock
                .Setup(r => r.GetPurchaseSuccessTemplate(request.To, orderId, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendPurchaseSuccessMailAsync(request, orderId, url);
            }
            catch
            {
                // Expected
            }

            _emailRepoMock.Verify(r => r.GetPurchaseSuccessTemplate(request.To, orderId, url), Times.Once);
        }

        [Fact]
        public async Task SendPurchaseFailedMailAsync_ShouldHandleLongReason()
        {
            // Arrange
            var request = new PurchaseFailedDto { To = "buyer@example.com" };
            var orderId = "ORD-123";
            var reason = "Payment was declined due to insufficient funds. Please check your account balance and try again. If the problem persists, contact your bank.";
            var url = "https://example.com/retry";
            var expectedTemplate = "<html>Failed</html>";

            _emailRepoMock
                .Setup(r => r.GetPurchaseFailedTemplate(request.To, orderId, reason, url))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendPurchaseFailedMailAsync(request, orderId, reason, url);
            }
            catch
            {
                // Expected
            }

            _emailRepoMock.Verify(r => r.GetPurchaseFailedTemplate(request.To, orderId, reason, url), Times.Once);
        }

        [Fact]
        public async Task SendNewStaffMailAsync_ShouldHandleComplexPassword()
        {
            // Arrange
            var request = new NewStaffTemplateDto
            {
                To = "staff@example.com",
                Password = "C0mpl3x!P@ssw0rd#2024",
                ActionUrl = "https://example.com/login"
            };
            var logoUrl = "https://cdn.example.com/images/logo.png";
            var expectedTemplate = "<html>Staff welcome</html>";

            _emailRepoMock
                .Setup(r => r.GetNewStaffTemplateAsync(request.To, request.Password, request.ActionUrl, logoUrl))
                .ReturnsAsync(expectedTemplate);

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act & Assert
            try
            {
                await service.SendNewStaffMailAsync(request, logoUrl);
            }
            catch
            {
                // Expected
            }

            _emailRepoMock.Verify(r => r.GetNewStaffTemplateAsync(request.To, request.Password, request.ActionUrl, logoUrl), Times.Once);
        }

        [Fact]
        public void MailService_ShouldInitialize_WithValidSettings()
        {
            // Arrange & Act
            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Assert
            Assert.NotNull(service);
        }

        [Fact]
        public async Task SendWelcomeMailAsync_ShouldCallRepository_ForMultipleUsers()
        {
            // Arrange
            var users = new[]
            {
                new WelcomeDto { To = "user1@example.com" },
                new WelcomeDto { To = "user2@example.com" },
                new WelcomeDto { To = "user3@example.com" }
            };
            var url = "https://example.com/welcome";

            _emailRepoMock
                .Setup(r => r.GetWelcomeTemplate(It.IsAny<string>(), url))
                .ReturnsAsync("<html>Welcome</html>");

            var service = new MailService(_mailSettingsMock.Object, _emailRepoMock.Object);

            // Act
            foreach (var user in users)
            {
                try
                {
                    await service.SendWelcomeMailAsync(user, url);
                }
                catch
                {
                    // Expected
                }
            }

            // Assert
            _emailRepoMock.Verify(r => r.GetWelcomeTemplate(It.IsAny<string>(), url), Times.Exactly(3));
        }
    }
}