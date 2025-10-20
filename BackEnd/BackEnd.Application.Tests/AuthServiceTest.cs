using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.Services;
using Application.Validations;
using Domain.Entities;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace BackEnd.Application.Tests
{
    public class AuthServiceTest
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<IOptionsMonitor<AppSetting>> _appSettingsMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly AuthService _service;
        private readonly AppSetting _appSettings;

        public AuthServiceTest()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _configMock = new Mock<IConfiguration>();
            _appSettingsMock = new Mock<IOptionsMonitor<AppSetting>>();
            _loggerMock = new Mock<ILogger<AuthService>>();

            _appSettings = new AppSetting
            {
                SecretKey = "test-secret-key-that-is-long-enough-for-testing",
                GoogleClientId = "test-google-client-id.apps.googleusercontent.com",
                GoogleClientSecret = "test-secret"
            };

            _configMock.Setup(c => c["Jwt:Key"]).Returns("test-secret-key-that-is-long-enough-for-jwt-signing-minimum-32-characters");
            _configMock.Setup(c => c["Jwt:Issuer"]).Returns("test-issuer");
            _configMock.Setup(c => c["Jwt:Audience"]).Returns("test-audience");
            _appSettingsMock.Setup(a => a.CurrentValue).Returns(_appSettings);

            _service = new AuthService(_userRepoMock.Object, _configMock.Object, _appSettingsMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnAuthResponse_WhenValidInput()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "John Doe",
                Email = "john.doe@example.com",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.RegisterAsync(registerDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("john.doe@example.com", result.Email);
            Assert.Equal("Buyer", result.Role);
            Assert.NotEmpty(result.Token);
            _userRepoMock.Verify(r => r.AddAsync(It.Is<User>(u => 
                u.Email == "john.doe@example.com" && 
                u.FullName == "John Doe" &&
                u.Role == "Buyer"
            )), Times.Once);
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrowValidationException_WhenEmailAlreadyExists()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "Jane Doe",
                Email = "existing@example.com",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            var existingUser = new User
            {
                UserId = 1,
                Email = "existing@example.com",
                FullName = "Existing User",
                PasswordHash = "hash",
                Role = "Buyer"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync("existing@example.com")).ReturnsAsync(existingUser);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.RegisterAsync(registerDto));
            Assert.Equal("Email already registered", exception.Message);
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrowValidationException_WhenPasswordsDoNotMatch()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@example.com",
                Password = "SecurePass123!",
                ConfirmPassword = "DifferentPass123!"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => _service.RegisterAsync(registerDto));
        }

        [Fact]
        public async Task RegisterAsync_ShouldThrowValidationException_WhenEmailIsInvalid()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "invalid-email",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => _service.RegisterAsync(registerDto));
        }

        [Fact]
        public async Task RegisterAsync_ShouldTrimFullNameAndLowercaseEmail()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "  John Doe  ",
                Email = "JOHN.DOE@EXAMPLE.COM",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.RegisterAsync(registerDto);

            // Assert
            Assert.Equal("john.doe@example.com", result.Email);
            _userRepoMock.Verify(r => r.AddAsync(It.Is<User>(u => 
                u.Email == "john.doe@example.com" && 
                u.FullName == "John Doe"
            )), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnAuthResponse_WhenCredentialsAreValid()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "SecurePass123!"
            };

            var user = new User
            {
                UserId = 1,
                Email = "test@example.com",
                FullName = "Test User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass123!"),
                Role = "Buyer",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync("test@example.com")).ReturnsAsync(user);

            // Act
            var result = await _service.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.UserId);
            Assert.Equal("test@example.com", result.Email);
            Assert.Equal("Buyer", result.Role);
            Assert.NotEmpty(result.Token);
        }

        [Fact]
        public async Task LoginAsync_ShouldThrowInvalidOperationException_WhenEmailDoesNotExist()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "SecurePass123!"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync("nonexistent@example.com")).ReturnsAsync((User)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.LoginAsync(loginDto));
            Assert.Equal("Invalid email", exception.Message);
        }

        [Fact]
        public async Task LoginAsync_ShouldThrowInvalidOperationException_WhenPasswordIsIncorrect()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword123!"
            };

            var user = new User
            {
                UserId = 1,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!"),
                Role = "Buyer"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync("test@example.com")).ReturnsAsync(user);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.LoginAsync(loginDto));
            Assert.Equal("Invalid password", exception.Message);
        }

        [Fact]
        public async Task ChangePasswordAsync_ShouldReturnTrue_WhenPasswordChangedSuccessfully()
        {
            // Arrange
            int userId = 1;
            var request = new ChangePasswordRequestDto
            {
                CurrentPassword = "OldPass123!",
                NewPassword = "NewPass123!",
                ConfirmPassword = "NewPass123!"
            };

            var user = new User
            {
                UserId = userId,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPass123!"),
                Role = "Buyer",
                IsDeleted = false
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
            _userRepoMock.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.ChangePasswordAsync(userId, request);

            // Assert
            Assert.True(result);
            _userRepoMock.Verify(r => r.UpdateAsync(It.Is<User>(u => 
                u.UserId == userId && 
                !string.IsNullOrEmpty(u.PasswordHash)
            )), Times.Once);
        }

        [Fact]
        public async Task ChangePasswordAsync_ShouldThrowArgumentException_WhenPasswordsDoNotMatch()
        {
            // Arrange
            int userId = 1;
            var request = new ChangePasswordRequestDto
            {
                CurrentPassword = "OldPass123!",
                NewPassword = "NewPass123!",
                ConfirmPassword = "DifferentPass123!"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.ChangePasswordAsync(userId, request));
            Assert.Equal("Confirmation password does not match.", exception.Message);
        }

        [Fact]
        public async Task ChangePasswordAsync_ShouldThrowKeyNotFoundException_WhenUserDoesNotExist()
        {
            // Arrange
            int userId = 999;
            var request = new ChangePasswordRequestDto
            {
                CurrentPassword = "OldPass123!",
                NewPassword = "NewPass123!",
                ConfirmPassword = "NewPass123!"
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync((User)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.ChangePasswordAsync(userId, request));
            Assert.Equal("User not found.", exception.Message);
        }

        [Fact]
        public async Task ChangePasswordAsync_ShouldThrowUnauthorizedAccessException_WhenCurrentPasswordIsIncorrect()
        {
            // Arrange
            int userId = 1;
            var request = new ChangePasswordRequestDto
            {
                CurrentPassword = "WrongOldPass123!",
                NewPassword = "NewPass123!",
                ConfirmPassword = "NewPass123!"
            };

            var user = new User
            {
                UserId = userId,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectOldPass123!"),
                Role = "Buyer",
                IsDeleted = false
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.ChangePasswordAsync(userId, request));
            Assert.Equal("The current password is incorrect.", exception.Message);
        }

        [Fact]
        public async Task ChangePasswordAsync_ShouldThrowInvalidOperationException_WhenUserHasNoPassword()
        {
            // Arrange
            int userId = 1;
            var request = new ChangePasswordRequestDto
            {
                CurrentPassword = "OldPass123!",
                NewPassword = "NewPass123!",
                ConfirmPassword = "NewPass123!"
            };

            var user = new User
            {
                UserId = userId,
                Email = "test@example.com",
                PasswordHash = string.Empty, // Google login user
                Role = "Buyer",
                IsDeleted = false
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.ChangePasswordAsync(userId, request));
            Assert.Equal("Cannot change password for Google login users.", exception.Message);
        }

        [Fact]
        public async Task ChangePasswordAsync_ShouldThrowKeyNotFoundException_WhenUserIsDeleted()
        {
            // Arrange
            int userId = 1;
            var request = new ChangePasswordRequestDto
            {
                CurrentPassword = "OldPass123!",
                NewPassword = "NewPass123!",
                ConfirmPassword = "NewPass123!"
            };

            var user = new User
            {
                UserId = userId,
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldPass123!"),
                Role = "Buyer",
                IsDeleted = true
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.ChangePasswordAsync(userId, request));
            Assert.Equal("User not found.", exception.Message);
        }

        [Fact]
        public void GenerateUserId_ShouldReturnPositiveInteger()
        {
            // Act
            var userId1 = AuthService.GenerateUserId();
            var userId2 = AuthService.GenerateUserId();

            // Assert
            Assert.True(userId1 > 0);
            Assert.True(userId2 > 0);
        }

        [Fact]
        public void GenerateUserId_ShouldReturnDifferentIds_WhenCalledMultipleTimes()
        {
            // Act
            var userId1 = AuthService.GenerateUserId();
            Thread.Sleep(10); // Small delay to ensure different timestamp
            var userId2 = AuthService.GenerateUserId();

            // Assert
            Assert.NotEqual(userId1, userId2);
        }

        [Fact]
        public async Task RegisterAsync_ShouldHashPassword()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@example.com",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            User capturedUser = null;
            _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);

            // Act
            await _service.RegisterAsync(registerDto);

            // Assert
            Assert.NotNull(capturedUser);
            Assert.NotEqual("SecurePass123!", capturedUser.PasswordHash);
            Assert.True(BCrypt.Net.BCrypt.Verify("SecurePass123!", capturedUser.PasswordHash));
        }

        [Fact]
        public async Task LoginAsync_ShouldGenerateValidToken()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "SecurePass123!"
            };

            var user = new User
            {
                UserId = 1,
                Email = "test@example.com",
                FullName = "Test User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePass123!"),
                Role = "Buyer"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync("test@example.com")).ReturnsAsync(user);

            // Act
            var result = await _service.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(result.Token);
            Assert.True(result.ExpiresAt > DateTime.UtcNow);
            Assert.Equal("local", result.AuthProvider);
        }

        [Fact]
        public async Task RegisterAsync_ShouldSetDefaultRole_ToBuyer()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "New User",
                Email = "newuser@example.com",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.RegisterAsync(registerDto);

            // Assert
            Assert.Equal("Buyer", result.Role);
        }

        [Fact]
        public async Task RegisterAsync_ShouldSetIsDeletedToFalse()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "New User",
                Email = "newuser@example.com",
                Password = "SecurePass123!",
                ConfirmPassword = "SecurePass123!"
            };

            User capturedUser = null;
            _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);

            // Act
            await _service.RegisterAsync(registerDto);

            // Assert
            Assert.NotNull(capturedUser);
            Assert.False(capturedUser.IsDeleted);
        }
    }
}