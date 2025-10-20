using Application.DTOs.ManageStaffDtos;
using Application.IRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Moq;

namespace BackEnd.Application.Tests
{
    public class StaffManagementServiceTest
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IPermissionRepository> _permissionRepoMock;
        private readonly Mock<IStaffPermissionRepository> _staffPermissionRepoMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly StaffManagementService _service;

        public StaffManagementServiceTest()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _permissionRepoMock = new Mock<IPermissionRepository>();
            _staffPermissionRepoMock = new Mock<IStaffPermissionRepository>();
            _mapperMock = new Mock<IMapper>();

            _service = new StaffManagementService(
                _userRepoMock.Object,
                _permissionRepoMock.Object,
                _staffPermissionRepoMock.Object,
                _mapperMock.Object
            );
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldReturnUser_WhenValidRequest()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john.staff@example.com",
                Password = "SecurePass123!",
                Phone = "1234567890",
                Permissions = new List<string> { "ViewUsers", "EditUsers" }
            };

            var permissions = new List<Permission>
            {
                new Permission { PermissionId = 1, PermissionName = "ViewUsers" },
                new Permission { PermissionId = 2, PermissionName = "EditUsers" }
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(permissions);
            _staffPermissionRepoMock.Setup(r => r.AssignPermissionsToStaffAsync(It.IsAny<int>(), It.IsAny<List<int>>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CreateStaffAccountAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("John Staff", result.FullName);
            Assert.Equal("john.staff@example.com", result.Email);
            Assert.Equal("staff", result.Role);
            Assert.Equal("active", result.AccountStatus);
            _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
            _staffPermissionRepoMock.Verify(r => r.AssignPermissionsToStaffAsync(It.IsAny<int>(), It.IsAny<List<int>>()), Times.Once);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldThrowException_WhenEmailAlreadyExists()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "existing@example.com",
                Password = "SecurePass123!",
                Phone = "1234567890"
            };

            var existingUser = new User
            {
                UserId = 1,
                Email = "existing@example.com",
                Role = "Buyer"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(existingUser);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _service.CreateStaffAccountAsync(request));
            Assert.Equal("Email already exists.", exception.Message);
            _userRepoMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldThrowException_WhenPasswordTooShort()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "short",
                Phone = "1234567890"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateStaffAccountAsync(request));
            Assert.Equal("Password must be at least 8 characters long.", exception.Message);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldThrowException_WhenPasswordIsEmpty()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "",
                Phone = "1234567890"
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateStaffAccountAsync(request));
            Assert.Equal("Password must be at least 8 characters long.", exception.Message);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldHashPassword()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "SecurePass123!",
                Phone = "1234567890"
            };

            User capturedUser = null;
            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(new List<Permission>());

            // Act
            await _service.CreateStaffAccountAsync(request);

            // Assert
            Assert.NotNull(capturedUser);
            Assert.NotEqual("SecurePass123!", capturedUser.PasswordHash);
            Assert.True(BCrypt.Net.BCrypt.Verify("SecurePass123!", capturedUser.PasswordHash));
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldThrowException_WhenInvalidPermissionProvided()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "SecurePass123!",
                Phone = "1234567890",
                Permissions = new List<string> { "ValidPermission", "InvalidPermission" }
            };

            var permissions = new List<Permission>
            {
                new Permission { PermissionId = 1, PermissionName = "ValidPermission" }
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(permissions);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateStaffAccountAsync(request));
            Assert.Contains("Invalid permission names: InvalidPermission", exception.Message);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldCreateStaffWithoutPermissions()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "SecurePass123!",
                Phone = "1234567890",
                Permissions = new List<string>()
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(new List<Permission>());

            // Act
            var result = await _service.CreateStaffAccountAsync(request);

            // Assert
            Assert.NotNull(result);
            _staffPermissionRepoMock.Verify(r => r.AssignPermissionsToStaffAsync(It.IsAny<int>(), It.IsAny<List<int>>()), Times.Never);
        }

        [Fact]
        public async Task AssignPermissionsToStaffAsync_ShouldAssignPermissions_WhenStaffExists()
        {
            // Arrange
            int staffId = 1;
            var permissionIds = new List<int> { 1, 2, 3 };
            var staff = new User
            {
                UserId = staffId,
                Email = "staff@example.com",
                Role = "staff"
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(staffId)).ReturnsAsync(staff);
            _staffPermissionRepoMock.Setup(r => r.AssignPermissionsToStaffAsync(staffId, permissionIds))
                .Returns(Task.CompletedTask);

            // Act
            await _service.AssignPermissionsToStaffAsync(staffId, permissionIds);

            // Assert
            _staffPermissionRepoMock.Verify(r => r.AssignPermissionsToStaffAsync(staffId, permissionIds), Times.Once);
        }

        [Fact]
        public async Task AssignPermissionsToStaffAsync_ShouldThrowException_WhenStaffNotFound()
        {
            // Arrange
            int staffId = 999;
            var permissionIds = new List<int> { 1, 2 };

            _userRepoMock.Setup(r => r.GetByIdAsync(staffId)).ReturnsAsync((User)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _service.AssignPermissionsToStaffAsync(staffId, permissionIds));
            Assert.Equal("Staff not found or user is not a staff member.", exception.Message);
        }

        [Fact]
        public async Task AssignPermissionsToStaffAsync_ShouldThrowException_WhenUserIsNotStaff()
        {
            // Arrange
            int userId = 1;
            var permissionIds = new List<int> { 1, 2 };
            var user = new User
            {
                UserId = userId,
                Email = "buyer@example.com",
                Role = "Buyer" // Not staff
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _service.AssignPermissionsToStaffAsync(userId, permissionIds));
            Assert.Equal("Staff not found or user is not a staff member.", exception.Message);
        }

        [Fact]
        public async Task GetPermissionsByStaffIdAsync_ShouldReturnPermissions_WhenStaffHasPermissions()
        {
            // Arrange
            int staffId = 1;
            var staffPermissions = new List<StaffPermission>
            {
                new StaffPermission { StaffUserId = staffId, PermissionId = 1 },
                new StaffPermission { StaffUserId = staffId, PermissionId = 2 }
            };

            var allPermissions = new List<Permission>
            {
                new Permission { PermissionId = 1, PermissionName = "ViewUsers", Description = "View users" },
                new Permission { PermissionId = 2, PermissionName = "EditUsers", Description = "Edit users" },
                new Permission { PermissionId = 3, PermissionName = "DeleteUsers", Description = "Delete users" }
            };

            var expectedDtos = new List<PermissionDto>
            {
                new PermissionDto { PermissionId = 1, PermissionName = "ViewUsers" },
                new PermissionDto { PermissionId = 2, PermissionName = "EditUsers" }
            };

            _staffPermissionRepoMock.Setup(r => r.GetPermissionsByStaffIdAsync(staffId))
                .ReturnsAsync(staffPermissions);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync())
                .ReturnsAsync(allPermissions);
            _mapperMock.Setup(m => m.Map<List<PermissionDto>>(It.IsAny<List<Permission>>()))
                .Returns(expectedDtos);

            // Act
            var result = await _service.GetPermissionsByStaffIdAsync(staffId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetPermissionsByStaffIdAsync_ShouldReturnEmpty_WhenStaffHasNoPermissions()
        {
            // Arrange
            int staffId = 1;
            var staffPermissions = new List<StaffPermission>();
            var allPermissions = new List<Permission>
            {
                new Permission { PermissionId = 1, PermissionName = "ViewUsers" }
            };

            _staffPermissionRepoMock.Setup(r => r.GetPermissionsByStaffIdAsync(staffId))
                .ReturnsAsync(staffPermissions);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync())
                .ReturnsAsync(allPermissions);
            _mapperMock.Setup(m => m.Map<List<PermissionDto>>(It.IsAny<List<Permission>>()))
                .Returns(new List<PermissionDto>());

            // Act
            var result = await _service.GetPermissionsByStaffIdAsync(staffId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllPermissionsAsync_ShouldReturnAllPermissions()
        {
            // Arrange
            var permissions = new List<Permission>
            {
                new Permission { PermissionId = 1, PermissionName = "ViewUsers" },
                new Permission { PermissionId = 2, PermissionName = "EditUsers" },
                new Permission { PermissionId = 3, PermissionName = "DeleteUsers" }
            };

            var expectedDtos = new List<PermissionDto>
            {
                new PermissionDto { PermissionId = 1, PermissionName = "ViewUsers" },
                new PermissionDto { PermissionId = 2, PermissionName = "EditUsers" },
                new PermissionDto { PermissionId = 3, PermissionName = "DeleteUsers" }
            };

            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(permissions);
            _mapperMock.Setup(m => m.Map<List<PermissionDto>>(permissions)).Returns(expectedDtos);

            // Act
            var result = await _service.GetAllPermissionsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
            _permissionRepoMock.Verify(r => r.GetAllPermissionAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllPermissionsAsync_ShouldReturnEmpty_WhenNoPermissions()
        {
            // Arrange
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(new List<Permission>());
            _mapperMock.Setup(m => m.Map<List<PermissionDto>>(It.IsAny<List<Permission>>()))
                .Returns(new List<PermissionDto>());

            // Act
            var result = await _service.GetAllPermissionsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldSetCorrectDefaults()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "SecurePass123!",
                Phone = "1234567890"
            };

            User capturedUser = null;
            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(new List<Permission>());

            // Act
            await _service.CreateStaffAccountAsync(request);

            // Assert
            Assert.NotNull(capturedUser);
            Assert.Equal("staff", capturedUser.Role);
            Assert.Equal("active", capturedUser.AccountStatus);
            Assert.Equal("not_submitted", capturedUser.KycStatus);
            Assert.False(capturedUser.IsDeleted);
        }

        [Fact]
        public async Task AssignPermissionsToStaffAsync_ShouldHandleEmptyPermissionList()
        {
            // Arrange
            int staffId = 1;
            var permissionIds = new List<int>();
            var staff = new User { UserId = staffId, Role = "staff" };

            _userRepoMock.Setup(r => r.GetByIdAsync(staffId)).ReturnsAsync(staff);
            _staffPermissionRepoMock.Setup(r => r.AssignPermissionsToStaffAsync(staffId, permissionIds))
                .Returns(Task.CompletedTask);

            // Act
            await _service.AssignPermissionsToStaffAsync(staffId, permissionIds);

            // Assert
            _staffPermissionRepoMock.Verify(r => r.AssignPermissionsToStaffAsync(staffId, permissionIds), Times.Once);
        }

        [Fact]
        public async Task CreateStaffAccountAsync_ShouldHandleMultipleInvalidPermissions()
        {
            // Arrange
            var request = new CreateStaffRequestDto
            {
                FullName = "John Staff",
                Email = "john@example.com",
                Password = "SecurePass123!",
                Permissions = new List<string> { "Invalid1", "Invalid2", "Invalid3" }
            };

            var permissions = new List<Permission>
            {
                new Permission { PermissionId = 1, PermissionName = "ValidPermission" }
            };

            _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User)null);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _permissionRepoMock.Setup(r => r.GetAllPermissionAsync()).ReturnsAsync(permissions);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateStaffAccountAsync(request));
            Assert.Contains("Invalid permission names:", exception.Message);
            Assert.Contains("Invalid1", exception.Message);
            Assert.Contains("Invalid2", exception.Message);
            Assert.Contains("Invalid3", exception.Message);
        }
    }
}