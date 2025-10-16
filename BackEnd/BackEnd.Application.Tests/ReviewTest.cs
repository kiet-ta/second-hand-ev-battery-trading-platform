using Application.DTOs.ReviewDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Application.Tests.RepositoriesTests
{
    [TestClass]
    public class ReviewRepositoryTests
    {
        private EvBatteryTradingContext _context = null!;
        private ReviewRepository _repository = null!;
        private Mock<IReviewRepository> _mockRepo = null!;
        private ReviewService _service = null!;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<EvBatteryTradingContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new EvBatteryTradingContext(options);
            _repository = new ReviewRepository(_context);
            _mockRepo = new Mock<IReviewRepository>();
            _service = new ReviewService(_mockRepo.Object);
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }


        [TestMethod]
        public async Task GetReviewsByTargetUserIdAsync_ShouldReturnEmptyList_WhenNoReviewsExist()
        {
            var result = await _repository.GetReviewsByTargetUserIdAsync(999);
            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.Count);
        }

        [TestMethod]
        public async Task GetReviewsByTargetUserIdAsync_ShouldReturnMultipleReviews()
        {
            _context.Reviews.AddRange(
                new Review { ReviewerId = 1, TargetUserId = 50, Rating = 3, Comment = "A" },
                new Review { ReviewerId = 2, TargetUserId = 50, Rating = 4, Comment = "B" }
            );
            await _context.SaveChangesAsync();

            var result = await _repository.GetReviewsByTargetUserIdAsync(50);

            Assert.AreEqual(2, result.Count);
            CollectionAssert.AreEquivalent(new[] { "A", "B" }, result.Select(r => r.Comment).ToArray());
        }

  
        [TestMethod]
        public async Task CreateReviewAsync_ShouldCallRepositoryOnce()
        {
            var dto = new CreateReviewDto { ReviewerId = 1, TargetUserId = 2, Rating = 5 };
            var expected = new ReviewResponseDto { ReviewerId = 1, TargetUserId = 2, Rating = 5 };

            _mockRepo.Setup(r => r.CreateReviewAsync(It.IsAny<CreateReviewDto>()))
                     .ReturnsAsync(expected);

            var result = await _service.CreateReviewAsync(dto);

            _mockRepo.Verify(r => r.CreateReviewAsync(It.IsAny<CreateReviewDto>()), Times.Once);
            Assert.AreEqual(5, result.Rating);
        }

        [TestMethod]
        public async Task GetReviewsByTargetUserIdAsync_ShouldCallRepositoryOnce()
        {
            int targetUserId = 5;
            _mockRepo.Setup(r => r.GetReviewsByTargetUserIdAsync(It.IsAny<int>()))
                     .ReturnsAsync(new List<ReviewResponseDto>());

            await _service.GetReviewsByTargetUserIdAsync(targetUserId);

            _mockRepo.Verify(r => r.GetReviewsByTargetUserIdAsync(targetUserId), Times.Once);
        }

        
        [TestMethod]
        public async Task GetReviewsByTargetUserIdAsync_ShouldReturnEmpty_WhenRepoReturnsNull()
        {
            int targetUserId = 12;
            _ = _mockRepo.Setup(r => r.GetReviewsByTargetUserIdAsync(It.IsAny<int>()))
                     .ReturnsAsync((List<ReviewResponseDto>?)null);

            var result = await _service.GetReviewsByTargetUserIdAsync(targetUserId);

            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.Count);
        }

    
        [TestMethod]
        public async Task GetReviewsByTargetUserIdAsync_ShouldHandleNullImageUrls()
        {
            var review = new Review
            {
                ReviewerId = 1,
                TargetUserId = 88,
                Rating = 5,
                Comment = "Null image test",
                ReviewImages = new List<ReviewImage> { new ReviewImage { ImageUrl = null } }
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var result = await _repository.GetReviewsByTargetUserIdAsync(88);

            Assert.IsNotNull(result[0].ReviewImages);
            Assert.AreEqual("", result[0].ReviewImages![0].ImageUrl);
        }

        [TestMethod]
        public async Task CreateReviewAsync_ShouldCreateReview_WhenValidDto()
        {
            var dto = new CreateReviewDto
            {
                ReviewerId = 1,
                ItemId = 10,
                TargetUserId = 99,
                Rating = 5,
                Comment = "Excellent product!"
            };

            var result = await _repository.CreateReviewAsync(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(dto.ReviewerId, result.ReviewerId);
            Assert.AreEqual("Excellent product!", result.Comment);

            var reviewInDb = _context.Reviews.FirstOrDefault();
            Assert.IsNotNull(reviewInDb);
            Assert.AreEqual("Excellent product!", reviewInDb!.Comment);
        }

        [TestMethod]
        public async Task CreateReviewAsync_ShouldCreateReviewWithImages_WhenDtoHasImages()
        {
            var dto = new CreateReviewDto
            {
                ReviewerId = 2,
                ItemId = 20,
                TargetUserId = 88,
                Rating = 4,
                Comment = "Good battery",
                ReviewImages = new List<CreateReviewImageDto>
                {
                    new CreateReviewImageDto { ImageUrl = "https://img.com/1" },
                    new CreateReviewImageDto { ImageUrl = "https://img.com/2" }
                }
            };

            var result = await _repository.CreateReviewAsync(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.ReviewImages?.Count ?? 0);
            Assert.AreEqual("https://img.com/1", result.ReviewImages![0].ImageUrl);
        }

  
        [TestMethod]
        public async Task CreateReviewAsync_ShouldSkipTransaction_WhenUsingInMemoryDatabase()
        {
            var dto = new CreateReviewDto
            {
                ReviewerId = 10,
                ItemId = 200,
                TargetUserId = 300,
                Rating = 4,
                Comment = "Smooth battery test"
            };

            var result = await _repository.CreateReviewAsync(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual("Smooth battery test", result.Comment);

            var reviewInDb = _context.Reviews.FirstOrDefault(r => r.ItemId == 200);
            Assert.IsNotNull(reviewInDb);
        }

   
        [TestMethod]
        public async Task GetReviewsByTargetUserIdAsync_ShouldIncludeImages()
        {
            var review = new Review
            {
                ReviewerId = 11,
                TargetUserId = 22,
                ItemId = 123,
                Rating = 4,
                Comment = "Good one",
                ReviewImages = new List<ReviewImage>
                {
                    new ReviewImage { ImageUrl = "https://img.com/xyz" }
                }
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var result = await _repository.GetReviewsByTargetUserIdAsync(22);

            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("https://img.com/xyz", result[0].ReviewImages!.First().ImageUrl);
        }
    }
}
