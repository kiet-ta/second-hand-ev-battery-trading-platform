using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Application.Tests.Services
{
    public class EVDetailServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly EVDetailService _service;

        public EVDetailServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _service = new EVDetailService(_mockUow.Object);
        }

        private CreateEvDetailDto MockCreateDto() => new CreateEvDetailDto
        {
            Title = "EV Test",
            CategoryId = 1,
            Brand = "BrandX",
            Model = "ModelY",
            Version = "V1",
            Year = 2025,
            BodyStyle = "Sedan",
            Color = "Red",
            LicensePlate = "ABC123",
            Price = 100000,
            Quantity = 1,
            Status = "Active",
            UpdatedBy = 1,
            HasAccessories = true,
            PreviousOwners = 0,
            IsRegistrationValid = true,
            Mileage = 0,
            LicenseUrl = "url"
        };

        private Item MockItem(int id = 1) => new Item
        {
            ItemId = id,
            ItemType = "Ev",
            CategoryId = 1,
            Title = "EV Test",
            Price = 100000,
            Quantity = 1,
            Status = "Active"
        };

        private EVDetail MockEV(int itemId = 1) => new EVDetail
        {
            ItemId = itemId,
            Brand = "BrandX",
            Model = "ModelY",
            Version = "V1",
            Year = 2025,
            BodyStyle = "Sedan",
            Color = "Red",
            LicensePlate = "ABC123",
            HasAccessories = true,
            PreviousOwners = 0,
            IsRegistrationValid = true,
            Mileage = 0,
            LicenseUrl = "url"
        };


        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenDtoNull() =>
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateAsync(null!));

        [Fact]
        public async Task CreateAsync_ShouldThrow_WhenTitleEmpty()
        {
            var dto = MockCreateDto(); dto.Title = "";
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        }

        


        [Fact]
        public async Task DeleteAsync_ShouldThrow_WhenNotExists()
        {
            _mockUow.Setup(u => u.EVDetails.ExistsAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(1));
        }

        [Fact]
        public async Task DeleteAsync_ShouldReturnTrue_WhenExists()
        {
            _mockUow.Setup(u => u.EVDetails.ExistsAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            _mockUow.Setup(u => u.EVDetails.DeleteAsync(1, It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.Items.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            var result = await _service.DeleteAsync(1);
            Assert.True(result);
        }


        [Fact]
        public async Task GetAllAsync_ShouldThrow_WhenNull()
        {
            _mockUow.Setup(u => u.EVDetails.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync((List<EVDetail>?)null);

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetAllAsync());
        }

        [Fact]
        public async Task GetAllAsync_ShouldThrow_WhenItemNotFound()
        {
            var evs = new List<EVDetail> { MockEV() };
            _mockUow.Setup(u => u.EVDetails.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(evs);
            _mockUow.Setup(u => u.Items.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Item?)null);

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetAllAsync());
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnList_WhenValid()
        {
            var evs = new List<EVDetail> { MockEV() };
            _mockUow.Setup(u => u.EVDetails.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(evs);
            _mockUow.Setup(u => u.Items.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockItem());

            var result = await _service.GetAllAsync();
            Assert.Single(result);
        }

 
        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenNotFound()
        {
            _mockUow.Setup(u => u.EVDetails.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((EVDetail?)null);

            var result = await _service.GetByIdAsync(1);
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrow_WhenItemNotFound()
        {
            _mockUow.Setup(u => u.EVDetails.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockEV());
            _mockUow.Setup(u => u.Items.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Item?)null);

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetByIdAsync(1));
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnDto_WhenValid()
        {
            _mockUow.Setup(u => u.EVDetails.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockEV());
            _mockUow.Setup(u => u.Items.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockItem());

            var result = await _service.GetByIdAsync(1);
            Assert.NotNull(result);
            Assert.Equal(1, result.ItemId);
        }


        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenNotExists()
        {
            _mockUow.Setup(u => u.EVDetails.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((EVDetail?)null);

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.UpdateAsync(1, new UpdateEvDetailDto()));
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenDuplicateLicense()
        {
            _mockUow.Setup(u => u.EVDetails.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockEV());
            _mockUow.Setup(u => u.Items.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockItem());
            _mockUow.Setup(u => u.Items.SaveChangesAsync())
                .ThrowsAsync(new DbUpdateException("duplicate", new Exception("UNIQUE")));

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _service.UpdateAsync(1, new UpdateEvDetailDto { LicensePlate = "ABC" }));
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnTrue_WhenValid()
        {
            _mockUow.Setup(u => u.EVDetails.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockEV());
            _mockUow.Setup(u => u.Items.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MockItem());
            _mockUow.Setup(u => u.Items.SaveChangesAsync()).Returns(Task.CompletedTask);

            var result = await _service.UpdateAsync(1, new UpdateEvDetailDto { Brand = "NewBrand" });
            Assert.True(result);
        }

        
    

   
        [Fact]
        public async Task SearchEvDetailAsync_ShouldReturnMappedList()
        {
            var searchResult = new List<EVDetail> { MockEV() };
            _mockUow.Setup(u => u.EVDetails.SearchEvDetailAsync(It.IsAny<EVSearchRequestDto>()))
                .ReturnsAsync(searchResult);

            var result = await _service.SearchEvDetailAsync(new EVSearchRequestDto());
            Assert.Single(result);
            Assert.Equal(1, result.First().ItemId);
        }
    }
}
