using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Application.Services;
using Domain.Entities;
using Moq;
using Xunit;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Tests.Services
{
    public class NewsServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly NewsService _service;

        public NewsServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _service = new NewsService(_mockUow.Object);
        }

        private News MockNews(int id = 1)
            => new News { NewsId = id, Title = "Test News" };


        [Fact]
        public async Task GetAllNews_ShouldReturnList()
        {
            var list = new List<News> { MockNews() };
            _mockUow.Setup(u => u.News.GetAllNewsAsync(1, 10)).ReturnsAsync(list);

            var result = await _service.GetAllNewsAsync(1, 10);

            Assert.Single(result);
        }


        [Fact]
        public async Task ApproveNews_ShouldThrow_WhenRepoReturnsFalse_FirstCall()
        {
            _mockUow.Setup(u => u.News.SetApprovedStatusAsync(1)).ReturnsAsync(false);

            await Assert.ThrowsAsync<Exception>(() => _service.ApproveNewsAsync(1));
        }

        [Fact]
        public async Task ApproveNews_ShouldThrow_WhenNewsIdInvalid()
        {
            _mockUow.Setup(u => u.News.SetApprovedStatusAsync(-1)).ReturnsAsync(true);

            await Assert.ThrowsAsync<ArgumentException>(() => _service.ApproveNewsAsync(-1));
        }

        [Fact]
        public async Task ApproveNews_ShouldThrow_WhenSecondRepoCallFails()
        {
            _mockUow.SetupSequence(u => u.News.SetApprovedStatusAsync(1))
                .ReturnsAsync(true)  
                .ReturnsAsync(false); 

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.ApproveNewsAsync(1));
        }

        [Fact]
        public async Task ApproveNews_ShouldReturnTrue_WhenAllValid()
        {
            _mockUow.SetupSequence(u => u.News.SetApprovedStatusAsync(1))
                .ReturnsAsync(true)
                .ReturnsAsync(true);

            var result = await _service.ApproveNewsAsync(1);

            Assert.True(result);
        }


        [Fact]
        public async Task GetNewsById_ShouldReturnNews()
        {
            _mockUow.Setup(u => u.News.GetNewsByIdAsync(1)).ReturnsAsync(MockNews());

            var news = await _service.GetNewsById(1);

            Assert.Equal(1, news.NewsId);
        }

        [Fact]
        public async Task GetNewsById_ShouldReturnNull_WhenNotFound()
        {
            _mockUow.Setup(u => u.News.GetNewsByIdAsync(1)).ReturnsAsync((News?)null);

            var news = await _service.GetNewsById(1);

            Assert.Null(news);
        }


        [Fact]
        public async Task CancelNews_ShouldThrow_WhenRepoReturnsFalse_FirstCall()
        {
            _mockUow.Setup(u => u.News.SetCanclledStatusAsync(1)).ReturnsAsync(false);

            await Assert.ThrowsAsync<Exception>(() => _service.CancelNewsAsync(1));
        }

        [Fact]
        public async Task CancelNews_ShouldThrow_WhenNewsIdInvalid()
        {
            _mockUow.Setup(u => u.News.SetCanclledStatusAsync(-1)).ReturnsAsync(true);

            await Assert.ThrowsAsync<ArgumentException>(() => _service.CancelNewsAsync(-1));
        }

        [Fact]
        public async Task CancelNews_ShouldThrow_WhenSecondRepoCallFails()
        {
            _mockUow.SetupSequence(u => u.News.SetCanclledStatusAsync(1))
                .ReturnsAsync(true)
                .ReturnsAsync(false);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CancelNewsAsync(1));
        }

        [Fact]
        public async Task CancelNews_ShouldReturnTrue_WhenAllValid()
        {
            _mockUow.SetupSequence(u => u.News.SetCanclledStatusAsync(1))
                .ReturnsAsync(true)
                .ReturnsAsync(true);

            var result = await _service.CancelNewsAsync(1);

            Assert.True(result);
        }


        [Fact]
        public async Task AddNews_ShouldThrow_WhenDtoIsNull()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.AddNewsAsync(null!));
        }

        [Fact]
        public async Task AddNews_ShouldThrow_WhenTitleIsEmpty()
        {
            var dto = new CreateNewsDto { Title = "" };

            await Assert.ThrowsAsync<ArgumentException>(() => _service.AddNewsAsync(dto));
        }



        [Fact]
        public async Task DeleteNews_ShouldThrow_WhenIdInvalid()
        {
            await Assert.ThrowsAsync<ArgumentException>(() => _service.DeleteNewsAsync(0));
        }

        [Fact]
        public async Task DeleteNews_ShouldThrow_WhenRepoReturnsFalse()
        {
            _mockUow.Setup(u => u.News.DeleteNewsById(1)).ReturnsAsync(false);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteNewsAsync(1));
        }

        [Fact]
        public async Task DeleteNews_ShouldSucceed_WhenValid()
        {
            _mockUow.Setup(u => u.News.DeleteNewsById(1)).ReturnsAsync(true);

            await _service.DeleteNewsAsync(1);

            _mockUow.Verify(u => u.News.DeleteNewsById(1), Times.Once);
        }


        [Fact]
        public async Task RejectNews_ShouldThrow_WhenIdInvalid()
        {
            await Assert.ThrowsAsync<ArgumentException>(() => _service.RejectNewsAsync(0));
        }

        [Fact]
        public async Task RejectNews_ShouldThrow_WhenRepoReturnsFalse()
        {
            _mockUow.Setup(u => u.News.UpdateNewsStatusAsync(1, "cancelled")).ReturnsAsync(false);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.RejectNewsAsync(1));
        }

        [Fact]
        public async Task RejectNews_ShouldReturnTrue_WhenValid()
        {
            _mockUow.Setup(u => u.News.UpdateNewsStatusAsync(1, "cancelled")).ReturnsAsync(true);

            var result = await _service.RejectNewsAsync(1);

            Assert.True(result);
        }
    }
}
