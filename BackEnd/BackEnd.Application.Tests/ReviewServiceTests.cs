using Application.DTOs.ReviewDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class ReviewServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly ReviewService _service;

        public ReviewServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _service = new ReviewService(null!, _mockUow.Object);
        }

        private CreateReviewDto MockReviewDto(int targetUserId = 1, int rating = 5, string comment = "Good")
        {
            return new CreateReviewDto
            {
                TargetUserId = targetUserId,
                Rating = rating,
                Comment = comment
            };
        }

        // 1. CreateReviewAsync - null DTO
        [Fact]
        public async Task CreateReviewAsync_ShouldThrow_WhenDtoIsNull()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateReviewAsync(null!, 1));
        }

        // 2. CreateReviewAsync - invalid rating
        [Theory]
        [InlineData(0)]
        [InlineData(6)]
        public async Task CreateReviewAsync_ShouldThrow_WhenRatingInvalid(int rating)
        {
            var dto = MockReviewDto(rating: rating);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReviewAsync(dto, 1));
        }

        // 3. CreateReviewAsync - invalid TargetUserId
        [Fact]
        public async Task CreateReviewAsync_ShouldThrow_WhenTargetUserIdInvalid()
        {
            var dto = MockReviewDto(targetUserId: 0);
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReviewAsync(dto, 1));
        }

        // 4. CreateReviewAsync - empty comment
        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public async Task CreateReviewAsync_ShouldThrow_WhenCommentEmpty(string comment)
        {
            var dto = MockReviewDto(comment: comment ?? "");
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateReviewAsync(dto, 1));
        }

        // 5. CreateReviewAsync - repository returns null
        [Fact]
        public async Task CreateReviewAsync_ShouldThrow_WhenRepoReturnsNull()
        {
            var dto = MockReviewDto();
            _mockUow.Setup(u => u.Reviews.CreateReviewAsync(dto, 1))
                    .ReturnsAsync((ReviewResponseDto?)null);

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateReviewAsync(dto, 1));
        }

        // 6. CreateReviewAsync - success
        [Fact]
        public async Task CreateReviewAsync_ShouldReturnReviewResponse()
        {
            var dto = MockReviewDto();
            var response = new ReviewResponseDto { ReviewerId = 1, Rating = dto.Rating, Comment = dto.Comment };
            _mockUow.Setup(u => u.Reviews.CreateReviewAsync(dto, 1)).ReturnsAsync(response);

            var result = await _service.CreateReviewAsync(dto, 1);
            Assert.Equal(response.ReviewerId, result.ReviewerId);
            Assert.Equal(response.Comment, result.Comment);
        }

        // 7. GetReviewsByTargetUserIdAsync - invalid id
        [Fact]
        public async Task GetReviewsByTargetUserIdAsync_ShouldThrow_WhenTargetUserIdInvalid()
        {
            await Assert.ThrowsAsync<ArgumentException>(() => _service.GetReviewsByTargetUserIdAsync(0));
        }

        // 8. GetReviewsByTargetUserIdAsync - no reviews
        [Fact]
        public async Task GetReviewsByTargetUserIdAsync_ShouldThrow_WhenNoReviews()
        {
            _mockUow.Setup(u => u.Reviews.GetReviewsByTargetUserIdAsync(1))
                    .ReturnsAsync(new List<ReviewResponseDto>());

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetReviewsByTargetUserIdAsync(1));
        }

        // 9. GetReviewsByTargetUserIdAsync - success
        [Fact]
        public async Task GetReviewsByTargetUserIdAsync_ShouldReturnList()
        {
            var list = new List<ReviewResponseDto> { new ReviewResponseDto { ReviewerId = 1, Comment = "Great" } };
            _mockUow.Setup(u => u.Reviews.GetReviewsByTargetUserIdAsync(1)).ReturnsAsync(list);

            var result = await _service.GetReviewsByTargetUserIdAsync(1);
            Assert.Single(result);
            Assert.Equal("Great", result[0].Comment);
        }

        // 10. GetReviewAsync - invalid itemId
        [Fact]
        public async Task GetReviewAsync_ShouldThrow_WhenItemIdInvalid()
        {
            await Assert.ThrowsAsync<ArgumentException>(() => _service.GetReviewAsync(0));
        }

        // 11. GetReviewAsync - no reviews
        [Fact]
        public async Task GetReviewAsync_ShouldThrow_WhenNoReviews()
        {
            _mockUow.Setup(u => u.Reviews.GetReviewAsync(1)).ReturnsAsync(new List<Review>());
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetReviewAsync(1));
        }

        // 12. GetReviewAsync - success
        [Fact]
        public async Task GetReviewAsync_ShouldReturnList()
        {
            var reviews = new List<Review> { new Review { ReviewerId = 1, Comment = "Excellent" } };
            _mockUow.Setup(u => u.Reviews.GetReviewAsync(1)).ReturnsAsync(reviews);

            var result = await _service.GetReviewAsync(1);
            Assert.Single(result);
            Assert.Equal("Excellent", result[0].Comment);
        }

        // 13. CreateReviewAsync - multiple valid ratings
        [Theory]
        [InlineData(1)]
        [InlineData(3)]
        [InlineData(5)]
        public async Task CreateReviewAsync_ShouldAcceptValidRatings(int rating)
        {
            var dto = MockReviewDto(rating: rating);
            var response = new ReviewResponseDto { ReviewerId = 1, Rating = rating, Comment = "Good" };
            _mockUow.Setup(u => u.Reviews.CreateReviewAsync(dto, 1)).ReturnsAsync(response);

            var result = await _service.CreateReviewAsync(dto, 1);
            Assert.Equal(rating, result.Rating);
        }

        // 14. GetReviewsByTargetUserIdAsync - multiple reviews
        [Fact]
        public async Task GetReviewsByTargetUserIdAsync_ShouldReturnMultipleReviews()
        {
            var list = new List<ReviewResponseDto>
            {
                new ReviewResponseDto { ReviewerId = 1, Comment = "A" },
                new ReviewResponseDto { ReviewerId = 2, Comment = "B" }
            };
            _mockUow.Setup(u => u.Reviews.GetReviewsByTargetUserIdAsync(1)).ReturnsAsync(list);

            var result = await _service.GetReviewsByTargetUserIdAsync(1);
            Assert.Equal(2, result.Count);
        }

       [Fact]
        public async Task GetReviewAsync_ShouldReturnMultipleReviews()
        {
            var list = new List<Review>
            {
                new Review { ReviewerId = 1, Comment = "X" },
                new Review { ReviewerId = 2, Comment = "Y" }
            };
            _mockUow.Setup(u => u.Reviews.GetReviewAsync(1)).ReturnsAsync(list);

            var result = await _service.GetReviewAsync(1);
            Assert.Equal(2, result.Count);
        }
    }
}
