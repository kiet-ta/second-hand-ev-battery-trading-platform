using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;

namespace BackEnd.Application.Tests;

public class UserServiceTest
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly Mock<IConfiguration> _configMock;
    private User? _capturedUser;
    private readonly UserService _userService;

    public UserServiceTest()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _userRepoMock = new Mock<IUserRepository>();
        _configMock = new Mock<IConfiguration>();
        _capturedUser = null;

        // JWT config
        _configMock.SetupGet(c => c["Jwt:Key"]).Returns("DAY_LA_MOT_CAI_KEY_BI_MAT_RAT_DAI_DE_TEST_HS256");
        _configMock.SetupGet(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        _configMock.SetupGet(c => c["Jwt:Audience"]).Returns("TestAudience");

        // Capture AddAsync
        _userRepoMock.Setup(repo => repo.AddAsync(It.IsAny<User>()))
                     .Callback<User>(user => _capturedUser = user)
                     .Returns(Task.CompletedTask);

        // Mock UpdateAsync, DeleteAsync, SaveChangesAsync
        _userRepoMock.Setup(repo => repo.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepoMock.Setup(repo => repo.DeleteAsync(It.IsAny<int>())).Returns(Task.CompletedTask);
        _userRepoMock.Setup(repo => repo.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Setup Users property trên UnitOfWork
        _unitOfWorkMock.Setup(uow => uow.Users).Returns(_userRepoMock.Object);

        _userService = new UserService(_configMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task TC_USER_001_AddUserAsync_ShouldHashPassword()
    {
        var dto = new CreateUserDto
        {
            Email = "test@example.com",
            Password = "ValidPassword123",
            FullName = "Test User",
            Role = "Buyer"
        };

        _userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User?)null);

        var result = await _userService.AddUserAsync(dto);

        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        Assert.NotNull(_capturedUser);
        Assert.NotNull(_capturedUser!.PasswordHash);
        Assert.NotEqual(dto.Password, _capturedUser.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));
        Assert.NotNull(result);
        Assert.NotNull(result.Token);
    }

    [Fact]
    public async Task TC_USER_002_GetAllUsersAsync_ShouldReturnAllUsers()
    {
        var users = new List<User>
        {
            new User { UserId = 1, FullName = "User 1" },
            new User { UserId = 2, FullName = "User 2" }
        };
        _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(users);

        var result = await _userService.GetAllUsersAsync();

        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task TC_USER_003_GetUserByIdAsync_WithValidId_ShouldReturnUser()
    {
        var user = new User { UserId = 1, Email = "user1@example.com" };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

        var result = await _userService.GetUserByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result.UserId);
    }

    [Fact]
    public async Task TC_USER_004_GetUserByIdAsync_InvalidId_ShouldThrowKeyNotFound()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _userService.GetUserByIdAsync(999));

        Assert.Equal("User with ID 999 not found.", exception.Message);
    }

    [Fact]
    public async Task TC_USER_005_GetUserByEmailAsync_WithValidEmail_ShouldReturnUser()
    {
        var user = new User { UserId = 1, Email = "valid@example.com" };
        _userRepoMock.Setup(r => r.GetByEmailAsync("valid@example.com")).ReturnsAsync(user);

        var result = await _userService.GetUserByEmailAsync("valid@example.com");

        Assert.NotNull(result);
        Assert.Equal("valid@example.com", result.Email);
    }

    [Fact]
    public async Task TC_USER_006_GetUserByEmailAsync_InvalidEmail_ShouldReturnNull()
    {
        _userRepoMock.Setup(r => r.GetByEmailAsync("invalid@example.com")).ReturnsAsync((User?)null);

        var result = await _userService.GetUserByEmailAsync("invalid@example.com");

        Assert.Null(result);
    }


    [Fact]
    public async Task TC_USER_007_AddUserAsync_NewEmail_ShouldAddUser()
    {
        var dto = new CreateUserDto
        {
            Email = "new@example.com",
            Password = "Password123",
            FullName = "New User",
            Role = "Buyer"
        };
        _userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User?)null);

        var beforeDate = DateTime.UtcNow.AddSeconds(-1);

        var result = await _userService.AddUserAsync(dto);

        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        Assert.NotNull(_capturedUser);
        Assert.Equal("new@example.com", _capturedUser!.Email);
        Assert.Equal("New User", _capturedUser.FullName);
        Assert.Equal("Buyer", _capturedUser.Role);
        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));
        Assert.True(_capturedUser.CreatedAt >= beforeDate);
        Assert.True(_capturedUser.UpdatedAt >= beforeDate);
        Assert.NotNull(result.Token);
    }

    [Fact]
    public async Task TC_USER_021_AddUserAsync_ShouldSetCreatedAndUpdatedDates()
    {
        var dto = new CreateUserDto
        {
            Email = "newdate@example.com",
            Password = "Password123",
            FullName = "Date User",
            Role = "Buyer"
        };
        _userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User?)null);

        var beforeDate = DateTime.UtcNow.AddSeconds(-1);

        await _userService.AddUserAsync(dto);

        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        Assert.NotNull(_capturedUser);
        Assert.True(_capturedUser!.CreatedAt >= beforeDate);
        Assert.True(_capturedUser.UpdatedAt >= beforeDate);
    }


    [Fact]
    public async Task TC_USER_008_AddUserAsync_ExistingEmail_ShouldThrowInvalidOperationException()
    {
        var existingUser = new User { UserId = 1, Email = "existing@example.com" };
        _userRepoMock.Setup(r => r.GetByEmailAsync("existing@example.com")).ReturnsAsync(existingUser);

        var newUser = new User { Email = "existing@example.com" };

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _userService.AddUserAsync(newUser));

        Assert.Equal("Email already exists.", exception.Message);
    }

    [Fact]
    public async Task TC_USER_009_UpdateUserAsync_ValidId_ShouldUpdateUser()
    {
        var existingUser = new User
        {
            UserId = 1,
            FullName = "Old Name",
            Phone = "0123",
            Gender = "Male",
            AvatarProfile = "old.jpg",
            Role = "Buyer",
            KycStatus = "pending",
            AccountStatus = "active"
        };
        _userRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var updatedUser = new User
        {
            UserId = 1,
            FullName = "New Name",
            Phone = "4567",
            Gender = "Female",
            AvatarProfile = "new.jpg",
            Role = "Seller",
            KycStatus = "approved",
            AccountStatus = "ban"
        };
        var beforeDate = DateTime.UtcNow.AddSeconds(-1);

        await _userService.UpdateUserAsync(updatedUser);

        _userRepoMock.Verify(r => r.UpdateAsync(It.Is<User>(u =>
            u.UserId == 1 &&
            u.FullName == "New Name" &&
            u.Phone == "4567" &&
            u.Gender == "Female" &&
            u.AvatarProfile == "new.jpg" &&
            u.Role == "Seller" &&
            u.KycStatus == "approved" &&
            u.AccountStatus == "ban" &&
            u.UpdatedAt >= beforeDate
        )), Times.Once);
    }

    [Fact]
    public async Task TC_USER_010_UpdateUserAsync_InvalidId_ShouldThrowKeyNotFoundException()
    {
        _userRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _userService.UpdateUserAsync(new User { UserId = 999 }));

        Assert.Equal("User with ID 999 not found.", exception.Message);
    }

    [Fact]
    public async Task TC_USER_011_DeleteUserAsync_ShouldCallDelete()
    {
        await _userService.DeleteUserAsync(1);
        _userRepoMock.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    [Fact]
    public async Task TC_USER_012_AddUserAsync_FullInfo_ShouldAddUser()
    {
        var dto = new CreateUserDto
        {
            Email = "full@example.com",
            Password = "Password123",
            FullName = "Full User",
            DateOfBirth = new DateOnly(1990, 1, 1),
            Gender = "Male",
            Phone = "123456789",
            Role = "Seller"
        };
        _userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User?)null);

        await _userService.AddUserAsync(dto);

        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        Assert.NotNull(_capturedUser);
        Assert.Equal("full@example.com", _capturedUser!.Email);
        Assert.Equal("Full User", _capturedUser.FullName);
        Assert.Equal(new DateOnly(1990, 1, 1), _capturedUser.YearOfBirth);
        Assert.Equal("Male", _capturedUser.Gender);
        Assert.Equal("123456789", _capturedUser.Phone);
        Assert.Equal("Seller", _capturedUser.Role);
        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));
    }

    [Fact]
    public async Task TC_USER_013_AddUserAsync_MinInfo_ShouldAddUser()
    {
        var dto = new CreateUserDto
        {
            Email = "min@example.com",
            Password = "Password123",
            FullName = "Min User",
            Role = "Buyer"
        };
        _userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User?)null);

        await _userService.AddUserAsync(dto);

        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        Assert.NotNull(_capturedUser);
        Assert.Equal("min@example.com", _capturedUser!.Email);
        Assert.Equal("Min User", _capturedUser.FullName);
        Assert.Equal("Buyer", _capturedUser.Role);
        Assert.Null(_capturedUser.Phone);
        Assert.Null(_capturedUser.Gender);
        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));
    }


}
