using Application.IRepositories;
using Application.Services;
using Moq;

namespace BackEnd.Application.Tests
{
    public class NewsServiceTest
    {
        private readonly Mock<INewsRepository> _newsRepoMock;
        private readonly NewsService _service;

        public NewsServiceTest()
        {
            _newsRepoMock = new Mock<INewsRepository>();
            _service = new NewsService(_newsRepoMock.Object);
        }

        [Fact]
        public async Task ApproveNewsAsync_ShouldReturnTrue_WhenNewsIsApproved()
        {
            // Arrange
            int newsId = 1;
            _newsRepoMock
                .Setup(r => r.SetApprovedStatusAsync(newsId))
                .ReturnsAsync(true);

            // Act
            var result = await _service.ApproveNewsAsync(newsId);

            // Assert
            Assert.True(result);
            _newsRepoMock.Verify(r => r.SetApprovedStatusAsync(newsId), Times.Once);
        }

        [Fact]
        public async Task ApproveNewsAsync_ShouldReturnFalse_WhenNewsDoesNotExist()
        {
            // Arrange
            int newsId = 999;
            _newsRepoMock
                .Setup(r => r.SetApprovedStatusAsync(newsId))
                .ReturnsAsync(false);

            // Act
            var result = await _service.ApproveNewsAsync(newsId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ApproveNewsAsync_ShouldReturnFalse_WhenRepositoryThrowsException()
        {
            // Arrange
            int newsId = 1;
            _newsRepoMock
                .Setup(r => r.SetApprovedStatusAsync(newsId))
                .ThrowsAsync(new Exception("Database error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _service.ApproveNewsAsync(newsId));
        }

        [Fact]
        public async Task CancelNewsAsync_ShouldReturnTrue_WhenNewsIsCancelled()
        {
            // Arrange
            int newsId = 1;
            _newsRepoMock
                .Setup(r => r.SetCanclledStatusAsync(newsId))
                .ReturnsAsync(true);

            // Act
            var result = await _service.CancelNewsAsync(newsId);

            // Assert
            Assert.True(result);
            _newsRepoMock.Verify(r => r.SetCanclledStatusAsync(newsId), Times.Once);
        }

        [Fact]
        public async Task CancelNewsAsync_ShouldReturnFalse_WhenNewsDoesNotExist()
        {
            // Arrange
            int newsId = 999;
            _newsRepoMock
                .Setup(r => r.SetCanclledStatusAsync(newsId))
                .ReturnsAsync(false);

            // Act
            var result = await _service.CancelNewsAsync(newsId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CancelNewsAsync_ShouldHandleValidNewsIds()
        {
            // Arrange
            var newsIds = new[] { 1, 2, 3, 4, 5 };

            foreach (var id in newsIds)
            {
                _newsRepoMock
                    .Setup(r => r.SetCanclledStatusAsync(id))
                    .ReturnsAsync(true);
            }

            // Act & Assert
            foreach (var id in newsIds)
            {
                var result = await _service.CancelNewsAsync(id);
                Assert.True(result);
            }

            _newsRepoMock.Verify(r => r.SetCanclledStatusAsync(It.IsAny<int>()), Times.Exactly(5));
        }

        [Fact]
        public async Task ApproveNewsAsync_ShouldHandleMultipleApprovals()
        {
            // Arrange
            var newsIds = new[] { 1, 2, 3 };

            foreach (var id in newsIds)
            {
                _newsRepoMock
                    .Setup(r => r.SetApprovedStatusAsync(id))
                    .ReturnsAsync(true);
            }

            // Act & Assert
            foreach (var id in newsIds)
            {
                var result = await _service.ApproveNewsAsync(id);
                Assert.True(result);
            }

            _newsRepoMock.Verify(r => r.SetApprovedStatusAsync(It.IsAny<int>()), Times.Exactly(3));
        }

        [Fact]
        public async Task ApproveNewsAsync_ShouldHandleZeroNewsId()
        {
            // Arrange
            int newsId = 0;
            _newsRepoMock
                .Setup(r => r.SetApprovedStatusAsync(newsId))
                .ReturnsAsync(false);

            // Act
            var result = await _service.ApproveNewsAsync(newsId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CancelNewsAsync_ShouldHandleNegativeNewsId()
        {
            // Arrange
            int newsId = -1;
            _newsRepoMock
                .Setup(r => r.SetCanclledStatusAsync(newsId))
                .ReturnsAsync(false);

            // Act
            var result = await _service.CancelNewsAsync(newsId);

            // Assert
            Assert.False(result);
        }
    }
}