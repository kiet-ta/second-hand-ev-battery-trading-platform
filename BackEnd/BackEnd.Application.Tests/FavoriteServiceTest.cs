using Application.DTOs;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;

namespace BackEnd.Application.Tests
{
    public class FavoriteServiceTest
    {
        private readonly Mock<IFavoriteRepository> _favoriteRepoMock;
        private readonly FavoriteService _service;

        public FavoriteServiceTest()
        {
            _favoriteRepoMock = new Mock<IFavoriteRepository>();
            _service = new FavoriteService(_favoriteRepoMock.Object);
        }

        [Fact]
        public async Task CreateFavoriteAsync_ShouldReturnFavorite_WhenValidInput()
        {
            // Arrange
            var dto = new CreateFavoriteDto
            {
                UserId = 1,
                ItemId = 100,
                CreatedAt = DateTime.UtcNow
            };

            var expectedFavorite = new Favorite
            {
                FavId = 1,
                UserId = dto.UserId,
                ItemId = dto.ItemId,
                CreatedAt = dto.CreatedAt
            };

            _favoriteRepoMock
                .Setup(r => r.AddAsync(It.IsAny<Favorite>()))
                .ReturnsAsync(expectedFavorite);

            // Act
            var result = await _service.CreateFavoriteAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(dto.UserId, result.UserId);
            Assert.Equal(dto.ItemId, result.ItemId);
            _favoriteRepoMock.Verify(r => r.AddAsync(It.Is<Favorite>(f =>
                f.UserId == dto.UserId &&
                f.ItemId == dto.ItemId
            )), Times.Once);
        }

        [Fact]
        public async Task CreateFavoriteAsync_ShouldMapDtoCorrectly()
        {
            // Arrange
            var dto = new CreateFavoriteDto
            {
                UserId = 5,
                ItemId = 200,
                CreatedAt = new DateTime(2024, 1, 15)
            };

            Favorite capturedFavorite = null;
            _favoriteRepoMock
                .Setup(r => r.AddAsync(It.IsAny<Favorite>()))
                .Callback<Favorite>(f => capturedFavorite = f)
                .ReturnsAsync(new Favorite { FavId = 1, UserId = 5, ItemId = 200, CreatedAt = dto.CreatedAt });

            // Act
            await _service.CreateFavoriteAsync(dto);

            // Assert
            Assert.NotNull(capturedFavorite);
            Assert.Equal(5, capturedFavorite.UserId);
            Assert.Equal(200, capturedFavorite.ItemId);
            Assert.Equal(new DateTime(2024, 1, 15), capturedFavorite.CreatedAt);
        }

        [Fact]
        public async Task GetFavoritesByUserAsync_ShouldReturnFavorites_WhenUserHasFavorites()
        {
            // Arrange
            int userId = 1;
            var favoriteItems = new List<FavoriteItemDto>
            {
                new FavoriteItemDto { FavId = 1, ItemId = 100, ItemTitle = "Item 1" },
                new FavoriteItemDto { FavId = 2, ItemId = 101, ItemTitle = "Item 2" },
                new FavoriteItemDto { FavId = 3, ItemId = 102, ItemTitle = "Item 3" }
            };

            _favoriteRepoMock
                .Setup(r => r.GetFavoritesByUserIdAsync(userId))
                .ReturnsAsync(favoriteItems);

            // Act
            var result = await _service.GetFavoritesByUserAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count);
            Assert.Equal(100, result[0].ItemId);
            _favoriteRepoMock.Verify(r => r.GetFavoritesByUserIdAsync(userId), Times.Once);
        }

        [Fact]
        public async Task GetFavoritesByUserAsync_ShouldReturnEmptyList_WhenUserHasNoFavorites()
        {
            // Arrange
            int userId = 999;
            _favoriteRepoMock
                .Setup(r => r.GetFavoritesByUserIdAsync(userId))
                .ReturnsAsync(new List<FavoriteItemDto>());

            // Act
            var result = await _service.GetFavoritesByUserAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetFavoritesByUserAsync_ShouldHandleMultipleUsers()
        {
            // Arrange
            var user1Favorites = new List<FavoriteItemDto>
            {
                new FavoriteItemDto { FavId = 1, ItemId = 100, ItemTitle = "Item 1" }
            };
            var user2Favorites = new List<FavoriteItemDto>
            {
                new FavoriteItemDto { FavId = 2, ItemId = 200, ItemTitle = "Item 2" },
                new FavoriteItemDto { FavId = 3, ItemId = 201, ItemTitle = "Item 3" }
            };

            _favoriteRepoMock.Setup(r => r.GetFavoritesByUserIdAsync(1)).ReturnsAsync(user1Favorites);
            _favoriteRepoMock.Setup(r => r.GetFavoritesByUserIdAsync(2)).ReturnsAsync(user2Favorites);

            // Act
            var result1 = await _service.GetFavoritesByUserAsync(1);
            var result2 = await _service.GetFavoritesByUserAsync(2);

            // Assert
            Assert.Single(result1);
            Assert.Equal(2, result2.Count);
        }

        [Fact]
        public async Task DeleteFavoriteAsync_ShouldReturnTrue_WhenFavoriteExistsAndBelongsToUser()
        {
            // Arrange
            int favId = 1;
            int userId = 1;
            var favorite = new Favorite
            {
                FavId = favId,
                UserId = userId,
                ItemId = 100,
                CreatedAt = DateTime.UtcNow
            };

            _favoriteRepoMock.Setup(r => r.GetByIdAsync(favId)).ReturnsAsync(favorite);
            _favoriteRepoMock.Setup(r => r.DeleteAsync(It.IsAny<Favorite>())).Returns(Task.CompletedTask);

            // Act
            var result = await _service.DeleteFavoriteAsync(favId, userId);

            // Assert
            Assert.True(result);
            _favoriteRepoMock.Verify(r => r.GetByIdAsync(favId), Times.Once);
            _favoriteRepoMock.Verify(r => r.DeleteAsync(favorite), Times.Once);
        }

        [Fact]
        public async Task DeleteFavoriteAsync_ShouldReturnFalse_WhenFavoriteDoesNotExist()
        {
            // Arrange
            int favId = 999;
            int userId = 1;

            _favoriteRepoMock.Setup(r => r.GetByIdAsync(favId)).ReturnsAsync((Favorite)null);

            // Act
            var result = await _service.DeleteFavoriteAsync(favId, userId);

            // Assert
            Assert.False(result);
            _favoriteRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Favorite>()), Times.Never);
        }

        [Fact]
        public async Task DeleteFavoriteAsync_ShouldReturnFalse_WhenFavoriteDoesNotBelongToUser()
        {
            // Arrange
            int favId = 1;
            int userId = 1;
            var favorite = new Favorite
            {
                FavId = favId,
                UserId = 2, // Different user
                ItemId = 100,
                CreatedAt = DateTime.UtcNow
            };

            _favoriteRepoMock.Setup(r => r.GetByIdAsync(favId)).ReturnsAsync(favorite);

            // Act
            var result = await _service.DeleteFavoriteAsync(favId, userId);

            // Assert
            Assert.False(result);
            _favoriteRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Favorite>()), Times.Never);
        }

        [Fact]
        public async Task DeleteFavoriteAsync_ShouldPreventUnauthorizedDeletion()
        {
            // Arrange
            int favId = 1;
            int attackerUserId = 99;
            var favorite = new Favorite
            {
                FavId = favId,
                UserId = 1, // Owner
                ItemId = 100
            };

            _favoriteRepoMock.Setup(r => r.GetByIdAsync(favId)).ReturnsAsync(favorite);

            // Act
            var result = await _service.DeleteFavoriteAsync(favId, attackerUserId);

            // Assert
            Assert.False(result);
            _favoriteRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Favorite>()), Times.Never);
        }

        [Fact]
        public async Task CreateFavoriteAsync_ShouldHandleMultipleFavoritesForSameUser()
        {
            // Arrange
            var dto1 = new CreateFavoriteDto { UserId = 1, ItemId = 100, CreatedAt = DateTime.UtcNow };
            var dto2 = new CreateFavoriteDto { UserId = 1, ItemId = 101, CreatedAt = DateTime.UtcNow };

            _favoriteRepoMock.Setup(r => r.AddAsync(It.IsAny<Favorite>()))
                .ReturnsAsync((Favorite f) => new Favorite
                {
                    FavId = f.ItemId, // Use ItemId as FavId for uniqueness
                    UserId = f.UserId,
                    ItemId = f.ItemId,
                    CreatedAt = f.CreatedAt
                });

            // Act
            var result1 = await _service.CreateFavoriteAsync(dto1);
            var result2 = await _service.CreateFavoriteAsync(dto2);

            // Assert
            Assert.NotNull(result1);
            Assert.NotNull(result2);
            Assert.Equal(100, result1.ItemId);
            Assert.Equal(101, result2.ItemId);
            _favoriteRepoMock.Verify(r => r.AddAsync(It.IsAny<Favorite>()), Times.Exactly(2));
        }

        [Fact]
        public async Task GetFavoritesByUserAsync_ShouldReturnCorrectOrder()
        {
            // Arrange
            int userId = 1;
            var favoriteItems = new List<FavoriteItemDto>
            {
                new FavoriteItemDto { FavId = 3, ItemId = 102, ItemTitle = "Item 3" },
                new FavoriteItemDto { FavId = 1, ItemId = 100, ItemTitle = "Item 1" },
                new FavoriteItemDto { FavId = 2, ItemId = 101, ItemTitle = "Item 2" }
            };

            _favoriteRepoMock
                .Setup(r => r.GetFavoritesByUserIdAsync(userId))
                .ReturnsAsync(favoriteItems);

            // Act
            var result = await _service.GetFavoritesByUserAsync(userId);

            // Assert
            Assert.Equal(3, result.Count);
            Assert.Equal(3, result[0].FavId);
            Assert.Equal(1, result[1].FavId);
            Assert.Equal(2, result[2].FavId);
        }

        [Fact]
        public async Task CreateFavoriteAsync_ShouldHandleZeroUserId()
        {
            // Arrange
            var dto = new CreateFavoriteDto
            {
                UserId = 0,
                ItemId = 100,
                CreatedAt = DateTime.UtcNow
            };

            _favoriteRepoMock
                .Setup(r => r.AddAsync(It.IsAny<Favorite>()))
                .ReturnsAsync(new Favorite { FavId = 1, UserId = 0, ItemId = 100 });

            // Act
            var result = await _service.CreateFavoriteAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.UserId);
        }

        [Fact]
        public async Task DeleteFavoriteAsync_ShouldHandleNegativeFavId()
        {
            // Arrange
            int favId = -1;
            int userId = 1;

            _favoriteRepoMock.Setup(r => r.GetByIdAsync(favId)).ReturnsAsync((Favorite)null);

            // Act
            var result = await _service.DeleteFavoriteAsync(favId, userId);

            // Assert
            Assert.False(result);
        }
    }
}