using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IServices;
using Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace BackEnd.Application.Tests
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IPasswordResetTokenRepository> _otpRepoMock;
        private readonly Mock<IMailService> _mailServiceMock;
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<IOptionsMonitor<AppSetting>> _optionMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly Mock<IWalletRepository> _walletRepoMock;


        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _otpRepoMock = new Mock<IPasswordResetTokenRepository>();
            _mailServiceMock = new Mock<IMailService>();
            _uowMock = new Mock<IUnitOfWork>();
            _walletRepoMock = new Mock<IWalletRepository>();
            _configMock = new Mock<IConfiguration>();
            _optionMock = new Mock<IOptionsMonitor<AppSetting>>();
            _loggerMock = new Mock<ILogger<AuthService>>();

            _configMock.Setup(c => c["Jwt:Key"]).Returns("thisisatestkeywith32characters!!");
            _configMock.Setup(c => c["Jwt:Issuer"]).Returns("testissuer");
            _configMock.Setup(c => c["Jwt:Audience"]).Returns("testaudience");
            _optionMock.Setup(o => o.CurrentValue).Returns(new AppSetting { GoogleClientId = "test-google-client-id" });

            _uowMock.Setup(u => u.Users).Returns(_userRepoMock.Object);
            _uowMock.Setup(u => u.Wallets).Returns(_walletRepoMock.Object);

            _service = new AuthService(
                _userRepoMock.Object,
                _configMock.Object,
                _optionMock.Object,
                _loggerMock.Object,
                _otpRepoMock.Object,
                _mailServiceMock.Object,
                _uowMock.Object
            );
        }

        #region Register Tests

        [Fact]
        public async Task Register_ShouldThrow_WhenDtoInvalid() =>
            await Assert.ThrowsAsync<FluentValidation.ValidationException>(() => _service.RegisterAsync(new RegisterDto { Email = "", Password = "", FullName = "" }));

        [Fact]
        public async Task Register_ShouldThrow_WhenEmailExists()
        {
            var dto = new RegisterDto { Email = "exist@mail.com", Password = "Pass123!", FullName = "John" };
            _userRepoMock.Setup(u => u.GetByEmailAsync(dto.Email)).ReturnsAsync(new User());
            await Assert.ThrowsAsync<FluentValidation.ValidationException>(() => _service.RegisterAsync(dto));
        }



   
        #endregion

        #region Login Tests

        [Fact]
        public async Task Login_ShouldThrow_WhenEmailNotFound()
        {
            _userRepoMock.Setup(r => r.GetByEmailAsync("missing@mail.com")).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.LoginAsync(new LoginDto { Email = "missing@mail.com", Password = "123" }));
        }

        [Fact]
        public async Task Login_ShouldThrow_WhenPasswordIncorrect()
        {
            var user = new User { Email = "test@mail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct") };
            _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.LoginAsync(new LoginDto { Email = user.Email, Password = "wrong" }));
        }

        [Fact]
        public async Task Login_ShouldReturnToken_WhenValid()
        {
            var user = new User { Email = "user@mail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), UserId = 1, FullName = "User", Role = "Buyer" };
            _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _service.LoginAsync(new LoginDto { Email = user.Email, Password = "123456" });

            Assert.NotNull(result.Token);
            Assert.Equal(user.Email, result.Email);
        }

        #endregion

        #region Google Login Tests

        [Fact]
        public async Task GoogleLogin_ShouldThrow_WhenTokenEmpty() =>
            await Assert.ThrowsAsync<InvalidGoogleTokenException>(() => _service.LoginWithGoogleAsync(""));

        #endregion

        #region OTP / ResetPassword / ChangePassword Tests

        [Fact]
        public async Task SendOtp_ShouldThrow_WhenEmailNotFound()
        {
            _userRepoMock.Setup(r => r.GetByEmailAsync("missing@mail.com")).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.SendOtpAsync(new ForgotPasswordRequestDto { Email = "missing@mail.com" }));
        }

        [Fact]
        public async Task SendOtp_ShouldCallMailService_WhenEmailExists()
        {
            var user = new User { UserId = 1, Email = "test@mail.com" };
            _userRepoMock.Setup(r => r.GetByEmailAsync("test@mail.com")).ReturnsAsync(user);
            _otpRepoMock.Setup(r => r.CreateAsync(It.IsAny<PasswordResetToken>())).Returns(Task.CompletedTask);

            await _service.SendOtpAsync(new ForgotPasswordRequestDto { Email = "test@mail.com" });

            _mailServiceMock.Verify(m => m.SendOtpMailAsync(user.Email, It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task VerifyOtp_ShouldReturnFalse_WhenInvalid()
        {
            var user = new User { UserId = 1, Email = "test@mail.com" };
            _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);
            _otpRepoMock.Setup(r => r.GetValidTokenAsync(user.UserId, "000000")).ReturnsAsync((PasswordResetToken?)null);

            var result = await _service.VerifyOtpAsync(new VerifyOtpDto { Email = user.Email, OtpCode = "000000" });
            Assert.False(result);
        }

        [Fact]
        public async Task VerifyOtp_ShouldReturnTrue_WhenValid()
        {
            var user = new User { UserId = 1, Email = "test@mail.com" };
            _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);
            _otpRepoMock.Setup(r => r.GetValidTokenAsync(user.UserId, "123456"))
                .ReturnsAsync(new PasswordResetToken { UserId = 1, OtpCode = "123456", ExpirationTime = DateTime.Now.AddMinutes(5) });
            _otpRepoMock.Setup(r => r.MarkAsUsedAsync(It.IsAny<PasswordResetToken>())).Returns(Task.CompletedTask);

            var result = await _service.VerifyOtpAsync(new VerifyOtpDto { Email = user.Email, OtpCode = "123456" });
            Assert.True(result);
        }

        [Fact]
        public async Task ResetPassword_ShouldThrow_WhenPasswordsMismatch() =>
            await Assert.ThrowsAsync<Exception>(() => _service.ResetPasswordAsync(new ResetPasswordDto { Email = "a@mail.com", NewPassword = "a", ConfirmPassword = "b", OtpCode = "123456" }));

        [Fact]
        public async Task ResetPassword_ShouldSucceed_WhenOtpValid()
        {
            var user = new User { UserId = 1, Email = "test@mail.com" };
            _userRepoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);
            _otpRepoMock.Setup(r => r.GetValidTokenAsync(user.UserId, "123456"))
                .ReturnsAsync(new PasswordResetToken { UserId = 1, OtpCode = "123456", ExpirationTime = DateTime.Now.AddMinutes(5) });
            _otpRepoMock.Setup(r => r.MarkAsUsedAsync(It.IsAny<PasswordResetToken>())).Returns(Task.CompletedTask);
            _userRepoMock.Setup(r => r.UpdateAsync(user)).Returns(Task.CompletedTask);
            _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

            await _service.ResetPasswordAsync(new ResetPasswordDto { Email = user.Email, NewPassword = "Newpass123!", ConfirmPassword = "Newpass123!", OtpCode = "123456" });

            Assert.True(BCrypt.Net.BCrypt.Verify("Newpass123!", user.PasswordHash));
        }

        [Fact]
        public async Task ChangePassword_ShouldThrow_WhenUserNotFound()
        {
            _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((User?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.ChangePasswordAsync(1, new ChangePasswordRequestDto { NewPassword = "a", ConfirmPassword = "a" }));
        }

        [Fact]
        public async Task ChangePassword_ShouldThrow_WhenCurrentPasswordIncorrect()
        {
            var user = new User { PasswordHash = BCrypt.Net.BCrypt.HashPassword("oldpass"), IsDeleted = false };
            _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.ChangePasswordAsync(1, new ChangePasswordRequestDto { CurrentPassword = "wrong", NewPassword = "new", ConfirmPassword = "new" }));
        }

        [Fact]
        public async Task ChangePassword_ShouldReturnTrue_WhenSuccess()
        {
            var user = new User { PasswordHash = BCrypt.Net.BCrypt.HashPassword("oldpass"), IsDeleted = false, UserId = 1 };
            _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _uowMock.Setup(u => u.SaveChangesAsync(default)).ReturnsAsync(1);

            var result = await _service.ChangePasswordAsync(1, new ChangePasswordRequestDto { CurrentPassword = "oldpass", NewPassword = "Newpass123!", ConfirmPassword = "Newpass123!" });
            Assert.True(result);
        }

        #endregion
    }
}
