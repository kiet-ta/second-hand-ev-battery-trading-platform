//using Application.DTOs.UserDtos;
//using Application.IRepositories;
//using Application.Services;
//using Domain.Entities;
//using Microsoft.Extensions.Configuration;
//using Moq;

//namespace BackEnd.Application.Tests;

//public class UserServiceTest
//{
//    private readonly Mock<IUserRepository> _userRepoMock;
//    private readonly Mock<IConfiguration> _configMock;
//    private readonly UserService _userService;
//    private User _capturedUser; // Dùng để "bắt" user được truyền vào AddAsync

//    public UserServiceTest()
//    {
//        _userRepoMock = new Mock<IUserRepository>();
//        _configMock = new Mock<IConfiguration>();
//        _capturedUser = null; // Reset trước mỗi test

//        // === FIX LỖI 1 (JWT KEY) ===
//        // Key này phải đủ 32 bytes (256 bits)
//        var mockJwtKey = "DAY_LA_MOT_CAI_KEY_BI_MAT_RAT_DAI_DE_TEST_HS256"; // > 32 ky tu

//        _configMock.SetupGet(c => c["Jwt:Key"]).Returns(mockJwtKey);
//        _configMock.SetupGet(c => c["Jwt:Issuer"]).Returns("TestIssuer");
//        _configMock.SetupGet(c => c["Jwt:Audience"]).Returns("TestAudience");
//        // === KẾT THÚC FIX ===

//        // Setup Callback cho AddAsync để "bắt" entity
//        _userRepoMock.Setup(repo => repo.AddAsync(It.IsAny<User>()))
//            .Callback<User>(user => _capturedUser = user)
//            .Returns(Task.CompletedTask);

//        _userService = new UserService(_userRepoMock.Object, _configMock.Object);
//    }

//    // Tương ứng TC_USER_001: "Verify that the password is hashed before being saved."
//    // Test này kiểm tra method AddUserAsync(CreateUserDto dto)
//    [Fact]
//    public async Task TC_USER_001_AddUserAsync_CreateUserDto_ShouldHashPassword()
//    {
//        // Arrange
//        var dto = new CreateUserDto
//        {
//            Email = "test@example.com",
//            Password = "ValidPassword123", // Password gốc
//            FullName = "Test User",
//            Role = "Buyer"
//        };

//        _userRepoMock.Setup(repo => repo.GetByEmailAsync(dto.Email))
//            .ReturnsAsync((User)null);

//        // Act
//        var result = await _userService.AddUserAsync(dto);

//        // Assert
//        // 1. Kiểm tra AddAsync được gọi 1 lần
//        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);

//        // 2. Kiểm tra user đã được "bắt" (capture)
//        Assert.NotNull(_capturedUser);

//        // 3. Kiểm tra password đã được hash (BCrypt trực tiếp)
//        Assert.NotNull(_capturedUser.PasswordHash);
//        Assert.NotEqual(dto.Password, _capturedUser.PasswordHash);
//        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));

//        // 4. Kiểm tra token
//        Assert.NotNull(result);
//        Assert.NotNull(result.Token);
//    }

//    // Tương ứng TC_USER_002: "Verify retrieving all users."
//    [Fact]
//    public async Task TC_USER_002_GetAllUsersAsync_ShouldReturnAllUsers()
//    {
//        // Arrange
//        var users = new List<User>
//        {
//            new User { UserId = 1, FullName = "User 1" },
//            new User { UserId = 2, FullName = "User 2" }
//        };
//        _userRepoMock.Setup(repo => repo.GetAllAsync()).ReturnsAsync(users);

//        // Act
//        var result = await _userService.GetAllUsersAsync();

//        // Assert
//        Assert.NotNull(result);
//        Assert.Equal(2, result.Count());
//    }

//    // Tương ứng TC_USER_003: "Verify retrieving a user by ID."
//    [Fact]
//    public async Task TC_USER_003_GetUserByIdAsync_WithValidId_ShouldReturnUser()
//    {
//        // Arrange
//        var user = new User { UserId = 1, Email = "user1@example.com" };
//        _userRepoMock.Setup(repo => repo.GetByIdAsync(1)).ReturnsAsync(user);

//        // Act
//        var result = await _userService.GetUserByIdAsync(1);

//        // Assert
//        Assert.NotNull(result);
//        Assert.Equal(1, result.UserId);
//    }

//    // TC_USER_005: "Verify retrieving a user by email."
//    [Fact]
//    public async Task TC_USER_005_GetUserByEmailAsync_WithValidEmail_ShouldReturnUser()
//    {
//        // Arrange
//        var user = new User { UserId = 1, Email = "valid@example.com" };
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync("valid@example.com"))
//            .ReturnsAsync(user);

//        // Act
//        var result = await _userService.GetUserByEmailAsync("valid@example.com");

//        // Assert
//        Assert.NotNull(result);
//        Assert.Equal("valid@example.com", result.Email);
//    }

//    // Test case phụ cho TC_USER_005 (trường hợp email không tồn tại)
//    [Fact]
//    public async Task TC_USER_005_GetUserByEmailAsync_WithInvalidEmail_ShouldReturnNull()
//    {
//        // Arrange
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync("invalid@example.com"))
//            .ReturnsAsync((User)null);

//        // Act
//        var result = await _userService.GetUserByEmailAsync("invalid@example.com");

//        // Assert
//        Assert.Null(result);
//    }

//    // Tương ứng TC_USER_007: "Verify successfully adding a new user."
//    // Test này kiểm tra method AddUserAsync(User user)
//    [Fact]
//    public async Task TC_USER_007_AddUserAsync_WithNewEmail_ShouldAddUser()
//    {
//        // Arrange
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync("new@example.com"))
//            .ReturnsAsync((User)null);

//        var newUser = new User
//        {
//            Email = "new@example.com",
//            PasswordHash = "already_hashed_password"
//        };
//        var beforeDate = DateTime.Now.AddSeconds(-1);

//        // Act
//        await _userService.AddUserAsync(newUser);

//        // Assert
//        // 1. Kiểm tra AddAsync được gọi
//        _userRepoMock.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Once);

//        // 2. Kiểm tra entity được "bắt"
//        Assert.NotNull(_capturedUser);
//        Assert.Equal("new@example.com", _capturedUser.Email);
//        Assert.Equal("already_hashed_password", _capturedUser.PasswordHash);

//        // 3. Kiểm tra (TC_USER_021) CreatedAt và UpdatedAt đã được set
//        Assert.True(_capturedUser.CreatedAt >= beforeDate);
//        Assert.True(_capturedUser.UpdatedAt >= beforeDate);
//    }

//    // Tương ứng TC_USER_008: "Verify adding a user with an existing email."
//    [Fact]
//    public async Task TC_USER_008_AddUserAsync_WithExistingEmail_ShouldThrowInvalidOperationException()
//    {
//        // Arrange
//        var existingUser = new User { UserId = 1, Email = "existing@example.com" };
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync("existing@example.com"))
//            .ReturnsAsync(existingUser);

//        var newUser = new User { Email = "existing@example.com" };

//        // Act
//        Func<Task> act = () => _userService.AddUserAsync(newUser);

//        // Assert
//        var exception = await Assert.ThrowsAsync<InvalidOperationException>(act);
//        Assert.Equal("Email already exists.", exception.Message);
//    }

//    // Tương ứng TC_USER_009, 014, 015, 016, 017, 018, 019, 020
//    [Fact]
//    public async Task TC_USER_009_UpdateUserAsync_WithValidId_ShouldUpdateUser()
//    {
//        // Arrange
//        var existingUser = new User
//        {
//            UserId = 1,
//            FullName = "Old Name",
//            Phone = "0123",
//            Gender = "Male",
//            AvatarProfile = "old.jpg",
//            Role = "Buyer",
//            KycStatus = "pending",
//            AccountStatus = "active"
//        };
//        _userRepoMock.Setup(repo => repo.GetByIdAsync(1))
//            .ReturnsAsync(existingUser);

//        var updatedUserDto = new User
//        {
//            UserId = 1,
//            FullName = "New Name",
//            Phone = "4567",
//            Gender = "Female",
//            AvatarProfile = "new.jpg",
//            Role = "Seller",
//            KycStatus = "approved",
//            AccountStatus = "ban"
//        };
//        var beforeDate = DateTime.Now.AddSeconds(-1);

//        // Act
//        await _userService.UpdateUserAsync(updatedUserDto);

//        // Assert
//        // Kiểm tra UpdateAsync được gọi 1 lần
//        _userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
//            u.UserId == 1 &&
//            u.FullName == "New Name" &&          // TC_USER_009
//            u.Phone == "4567" &&                // TC_USER_020
//            u.Gender == "Female" &&             // TC_USER_019
//            u.AvatarProfile == "new.jpg" &&     // TC_USER_018
//            u.Role == "Seller" &&               // TC_USER_017
//            u.KycStatus == "approved" &&        // TC_USER_015
//            u.AccountStatus == "ban" &&         // TC_USER_016
//            u.UpdatedAt >= beforeDate           // Check ngày update
//        )), Times.Once);
//    }

//    // Tương ứng TC_USER_010: "Verify updating a user with a non-existent ID."
//    [Fact]
//    public async Task TC_USER_010_UpdateUserAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
//    {
//        // Arrange
//        _userRepoMock.Setup(repo => repo.GetByIdAsync(999))
//            .ReturnsAsync((User)null);

//        var user = new User { UserId = 999, FullName = "Updated Name" };

//        // Act
//        Func<Task> act = () => _userService.UpdateUserAsync(user);

//        // Assert
//        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(act);
//        Assert.Equal("User with ID 999 not found.", exception.Message);
//    }

//    // Tương ứng TC_USER_011: "Verify successful user deletion."
//    [Fact]
//    public async Task TC_USER_011_DeleteUserAsync_ShouldCallRepositoryDeleteMethod()
//    {
//        // Arrange
//        // Act
//        await _userService.DeleteUserAsync(1);

//        // Assert
//        _userRepoMock.Verify(repo => repo.DeleteAsync(1), Times.Once);
//    }

//    // Tương ứng TC_USER_012: "Verify adding a new user with complete information."
//    [Fact]
//    public async Task TC_USER_012_AddUserAsync_CreateUserDto_FullInfo_ShouldAddUser()
//    {
//        // Arrange
//        var dto = new CreateUserDto
//        {
//            Email = "full@example.com",
//            Password = "Password123",
//            FullName = "Full User",
//            DateOfBirth = new DateOnly(1990, 1, 1),
//            Gender = "Male",
//            Phone = "123456789",
//            Role = "Seller"
//        };
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync(dto.Email))
//            .ReturnsAsync((User)null);

//        // Act
//        await _userService.AddUserAsync(dto);

//        // Assert
//        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
//        Assert.NotNull(_capturedUser);
//        Assert.Equal("full@example.com", _capturedUser.Email);
//        Assert.Equal("Full User", _capturedUser.FullName);
//        Assert.Equal(new DateOnly(1990, 1, 1), _capturedUser.YearOfBirth);
//        Assert.Equal("Male", _capturedUser.Gender);
//        Assert.Equal("123456789", _capturedUser.Phone);
//        Assert.Equal("Seller", _capturedUser.Role);
//        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));
//    }

//    // Tương ứng TC_USER_013: "Verify adding a new user with minimum required information."
//    [Fact]
//    public async Task TC_USER_013_AddUserAsync_CreateUserDto_MinInfo_ShouldAddUser()
//    {
//        // Arrange
//        var dto = new CreateUserDto
//        {
//            Email = "min@example.com",
//            Password = "Password123",
//            FullName = "Min User",
//            Role = "Buyer" // Giả sử Role là bắt buộc
//        };
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync(dto.Email))
//            .ReturnsAsync((User)null);

//        // Act
//        await _userService.AddUserAsync(dto);

//        // Assert
//        _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
//        Assert.NotNull(_capturedUser);
//        Assert.Equal("min@example.com", _capturedUser.Email);
//        Assert.Equal("Min User", _capturedUser.FullName);
//        Assert.Equal("Buyer", _capturedUser.Role);
//        Assert.Null(_capturedUser.Phone); // Check các trường khác là null
//        Assert.Null(_capturedUser.Gender);
//        Assert.True(BCrypt.Net.BCrypt.Verify(dto.Password, _capturedUser.PasswordHash));
//    }

//    // Tương ứng TC_USER_021: "Verify updating the date and time when adding a new user."
//    [Fact]
//    public async Task TC_USER_021_AddUserAsync_ShouldSetCreatedAndUpdatedDates()
//    {
//        // Arrange
//        _userRepoMock.Setup(repo => repo.GetByEmailAsync("newdate@example.com"))
//            .ReturnsAsync((User)null);

//        var newUser = new User { Email = "newdate@example.com", PasswordHash = "hash" };
//        var beforeDate = DateTime.Now.AddSeconds(-1); // Thêm 1s buffer

//        // Act
//        await _userService.AddUserAsync(newUser);

//        // Assert
//        _userRepoMock.Verify(repo => repo.AddAsync(It.IsAny<User>()), Times.Once);
//        Assert.NotNull(_capturedUser);
//        Assert.True(_capturedUser.CreatedAt >= beforeDate);
//        Assert.True(_capturedUser.UpdatedAt >= beforeDate);
//    }
//}