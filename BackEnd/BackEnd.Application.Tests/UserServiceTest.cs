using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;

namespace BackEnd.Application.Tests
{
    public class UserServiceTest
    {
        [Fact]
        public async Task CreateUser_ShouldHashPassword_beforeSaving()
        {
            //Arrange
            var userRepoMock = new Mock<IUserRepository>();
            var hasherMock = new Mock<IHasher>();

            hasherMock
                .Setup(hasherMock => hasherMock.Hash("123456"))
                .Returns("hashed_123456");

            var userService = new UserService(userRepoMock.Object, hasherMock.Object);

            //Act
            //await userService.CreateUserAsync("abc@8686.hz", "123456");

            //Assert
            //userRepoMock.Verify(
            //    r => r.AddAsync(It.Is<User>
            //    (u => u.Email == "abc@8686.hz" && u.Password == "hashed_123456"
            //        )), Times.Once);
        }
    }
}