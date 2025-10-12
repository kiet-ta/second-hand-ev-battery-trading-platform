using Application.IHelpers;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace BackEnd.Application.Tests
{
    public class UserServiceTest
    {
        // concise style
        [Fact]
        public async Task CreateUser_ShouldHashPassword_beforeSaving()
        {
            //Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            passwordHelperMock
                .Setup(helper => helper.HashPassword("123456"))
                .Returns("hashed_123456");

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var user = new User
            {
                Email = "abc@8686.hz",
                PasswordHash = "123456"
            };

            //Act
            await userService.AddUserAsync(user);

            //Assert
            userRepoMock.Verify(
                r => r.AddAsync(It.Is<User>(
                    u => u.Email == "abc@8686.hz" && u.PasswordHash == "hashed_123456"
                )), Times.Once);
        }


        [Fact]
        public async Task GetAllUsersAsync_ShouldReturnAllUsers()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var users = new List<User>
            {
                new User { UserId = 1, Email = "user1@example.com", FullName = "User 1" },
                new User { UserId = 2, Email = "user2@example.com", FullName = "User 2" }
            };

            userRepoMock.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(users);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            // Act
            var result = await userService.GetAllUsersAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, u => u.UserId == 1);
            Assert.Contains(result, u => u.UserId == 2);
        }


        [Fact]
        public async Task GetUserByIdAsync_WithValidId_ShouldReturnUser()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var user = new User { UserId = 1, Email = "user1@example.com", FullName = "User 1" };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(user);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            // Act
            var result = await userService.GetUserByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.UserId);
            Assert.Equal("user1@example.com", result.Email);
        }


        [Fact]
        public async Task GetUserByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((User)null);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            // Act
            var result = await userService.GetUserByIdAsync(999);

            // Assert
            Assert.Null(result);
        }



        [Fact]
        public async Task GetUserByEmailAsync_WithValidEmail_ShouldReturnUser()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var user = new User { UserId = 1, Email = "user1@example.com", FullName = "User 1" };

            userRepoMock.Setup(repo => repo.GetByEmailAsync("user1@example.com"))
                .ReturnsAsync(user);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            // Act
            var result = await userService.GetUserByEmailAsync("user1@example.com");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("user1@example.com", result.Email);
        }



        [Fact]
        public async Task GetUserByEmailAsync_WithInvalidEmail_ShouldReturnNull()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByEmailAsync("nonexistent@example.com"))
                .ReturnsAsync((User)null);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            // Act
            var result = await userService.GetUserByEmailAsync("nonexistent@example.com");

            // Assert
            Assert.Null(result);
        }



        [Fact]
        public async Task AddUserAsync_WithNewEmail_ShouldAddUser()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByEmailAsync("new@example.com"))
                .ReturnsAsync((User)null);

            passwordHelperMock.Setup(helper => helper.HashPassword("password123"))
                .Returns("hashed_password");

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var newUser = new User
            {
                Email = "new@example.com",
                FullName = "New User",
                PasswordHash = "password123"
            };

            // Act
            await userService.AddUserAsync(newUser);

            // Assert
            userRepoMock.Verify(repo => repo.AddAsync(It.Is<User>(u =>
                u.Email == "new@example.com" &&
                u.PasswordHash == "hashed_password")), Times.Once);
        }



        [Fact]
        public async Task AddUserAsync_WithExistingEmail_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User { UserId = 1, Email = "existing@example.com" };

            userRepoMock.Setup(repo => repo.GetByEmailAsync("existing@example.com"))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var newUser = new User
            {
                Email = "existing@example.com",
                FullName = "New User"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                async () => await userService.AddUserAsync(newUser));

            Assert.Equal("Email đã tồn tại!", exception.Message);
        }



        [Fact]
        public async Task UpdateUserAsync_WithValidId_ShouldUpdateUser()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "Old Name",
                Phone = "0123456789",
                Gender = "Male",
                Role = "Buyer",
                KycStatus = "not_submitted",
                AccountStatus = "active"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "Updated Name",
                Phone = "9876543210",
                Gender = "Female",
                Role = "Seller",
                KycStatus = "verified",
                AccountStatus = "active"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.FullName == "Updated Name" &&
                u.Phone == "9876543210" &&
                u.Gender == "Female" &&
                u.Role == "Seller" &&
                u.KycStatus == "verified")), Times.Once);
        }



        [Fact]
        public async Task UpdateUserAsync_WithInvalidId_ShouldThrowKeyNotFoundException()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByIdAsync(999))
                .ReturnsAsync((User)null);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var user = new User
            {
                UserId = 999,
                FullName = "Updated Name"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<KeyNotFoundException>(
                async () => await userService.UpdateUserAsync(user));

            Assert.Equal("User không tồn tại!", exception.Message);
        }


        [Fact]
        public async Task DeleteUserAsync_ShouldCallRepositoryDeleteMethod()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            // Act
            await userService.DeleteUserAsync(1);

            // Assert
            userRepoMock.Verify(repo => repo.DeleteAsync(1), Times.Once);
        }



        [Fact]
        public async Task AddUserAsync_WithFullInformation_ShouldAddUserWithAllFields()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByEmailAsync("full@example.com"))
                .ReturnsAsync((User)null);

            passwordHelperMock.Setup(helper => helper.HashPassword("password123"))
                .Returns("hashed_password");

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var newUser = new User
            {
                Email = "full@example.com",
                FullName = "Full User",
                PasswordHash = "password123",
                Gender = "Male",
                Phone = "0987654321",
                Role = "Seller",
                KycStatus = "pending",
                AccountStatus = "active"
            };

            // Act
            await userService.AddUserAsync(newUser);

            // Assert
            userRepoMock.Verify(repo => repo.AddAsync(It.Is<User>(u =>
                u.Email == "full@example.com" &&
                u.FullName == "Full User" &&
                u.PasswordHash == "hashed_password" &&
                u.Gender == "Male" &&
                u.Phone == "0987654321" &&
                u.Role == "Seller" &&
                u.KycStatus == "pending" &&
                u.AccountStatus == "active")), Times.Once);
        }



        [Fact]
        public async Task AddUserAsync_WithMinimalInformation_ShouldAddUserWithDefaultValues()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByEmailAsync("minimal@example.com"))
                .ReturnsAsync((User)null);

            passwordHelperMock.Setup(helper => helper.HashPassword("password123"))
                .Returns("hashed_password");

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var newUser = new User
            {
                Email = "minimal@example.com",
                FullName = "Minimal User",
                PasswordHash = "password123"
            };

            // Act
            await userService.AddUserAsync(newUser);

            // Assert
            userRepoMock.Verify(repo => repo.AddAsync(It.Is<User>(u =>
                u.Email == "minimal@example.com" &&
                u.FullName == "Minimal User" &&
                u.PasswordHash == "hashed_password" &&
                u.Role == "Buyer" &&
                u.KycStatus == "not_submitted" &&
                u.AccountStatus == "active")), Times.Once);
        }


        [Fact]
        public async Task UpdateUserAsync_WithPartialInformation_ShouldUpdateOnlyProvidedFields()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "Old Name",
                Phone = "0123456789",
                Gender = "Male",
                Role = "Buyer",
                KycStatus = "not_submitted",
                AccountStatus = "active"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "Updated Name",
                Phone = "9876543210"
                // Other fields not provided
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.FullName == "Updated Name" &&
                u.Phone == "9876543210" &&
                u.Gender == "Male" && 
                u.Role == "Buyer" && 
                u.KycStatus == "not_submitted")), Times.Once); 
        }


        [Fact]
        public async Task UpdateUserAsync_WithKycStatusChange_ShouldUpdateKycStatus()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "User Name",
                KycStatus = "not_submitted"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "User Name",
                KycStatus = "verified"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.KycStatus == "verified")), Times.Once);
        }


        [Fact]
        public async Task UpdateUserAsync_WithAccountStatusChange_ShouldUpdateAccountStatus()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "User Name",
                AccountStatus = "active"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "User Name",
                AccountStatus = "suspended"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.AccountStatus == "suspended")), Times.Once);
        }

        [Fact]
        public async Task UpdateUserAsync_WithRoleChange_ShouldUpdateRole()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "User Name",
                Role = "Buyer"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "User Name",
                Role = "Admin"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.Role == "Admin")), Times.Once);
        }

        [Fact]
        public async Task UpdateUserAsync_WithAvatarChange_ShouldUpdateAvatar()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "User Name",
                AvatarProfile = "old_avatar.jpg"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "User Name",
                AvatarProfile = "new_avatar.jpg"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.AvatarProfile == "new_avatar.jpg")), Times.Once);
        }

        [Fact]
        public async Task UpdateUserAsync_WithGenderChange_ShouldUpdateGender()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "User Name",
                Gender = "Male"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "User Name",
                Gender = "Female"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.Gender == "Female")), Times.Once);
        }

        [Fact]
        public async Task UpdateUserAsync_WithPhoneChange_ShouldUpdatePhone()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            var existingUser = new User
            {
                UserId = 1,
                Email = "user@example.com",
                FullName = "User Name",
                Phone = "0123456789"
            };

            userRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(existingUser);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var updatedUser = new User
            {
                UserId = 1,
                FullName = "User Name",
                Phone = "0987654321"
            };

            // Act
            await userService.UpdateUserAsync(updatedUser);

            // Assert
            userRepoMock.Verify(repo => repo.UpdateAsync(It.Is<User>(u =>
                u.UserId == 1 &&
                u.Phone == "0987654321")), Times.Once);
        }

        [Fact]
        public async Task AddUserAsync_ShouldSetCreatedAndUpdatedDates()
        {
            // Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var configMock = new Mock<IConfiguration>();
            var passwordHelperMock = new Mock<IPasswordHelper>();

            userRepoMock.Setup(repo => repo.GetByEmailAsync("new@example.com"))
                .ReturnsAsync((User)null);

            var userService = new UserService(userRepoMock.Object, configMock.Object, passwordHelperMock.Object);

            var newUser = new User
            {
                Email = "new@example.com",
                FullName = "New User",
                PasswordHash = "password123"
            };

            var beforeDate = DateTime.Now;

            // Act
            await userService.AddUserAsync(newUser);

            var afterDate = DateTime.Now;

            // Assert
            userRepoMock.Verify(repo => repo.AddAsync(It.Is<User>(u =>
                u.CreatedAt >= beforeDate &&
                u.CreatedAt <= afterDate &&
                u.UpdatedAt >= beforeDate &&
                u.UpdatedAt <= afterDate)), Times.Once);
        }
    }
}
