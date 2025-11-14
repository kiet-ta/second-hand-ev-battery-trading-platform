using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;
using Xunit;

namespace BackEnd.Application.Tests
{
    public class AddressServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IAddressRepository> _mockRepo;
        private readonly AddressService _service;

        public AddressServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockRepo = new Mock<IAddressRepository>();
            _mockUow.Setup(u => u.Address).Returns(_mockRepo.Object);
            _service = new AddressService(_mockUow.Object);
        }


        [Fact]
        public async Task AddAddressAsync_ShouldThrow_WhenAddingForAnotherUser()
        {
            var address = new Address { UserId = 2 };
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.AddAddressAsync(address, 1));
        }

        [Fact]
        public async Task AddAddressAsync_ShouldSetIsDeletedFalse_Always()
        {
            var address = new Address { UserId = 1, IsDeleted = true };
            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(1)).ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);

            Assert.False(address.IsDeleted);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldSetIsDefaultFalse_IfUserAlreadyHasDefault()
        {
            var existing = new List<Address> { new Address { IsDefault = true } };
            var newAddress = new Address { UserId = 1, IsDefault = true };

            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(1)).ReturnsAsync(existing);

            await _service.AddAddressAsync(newAddress, 1);

            Assert.False((bool)newAddress.IsDefault);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldCallRepositoryAdd()
        {
            var address = new Address { UserId = 1 };
            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(1)).ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);

            _mockRepo.Verify(r => r.AddAddressAsync(address), Times.Once);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldThrow_WhenUserIdIsZero()
        {
            var address = new Address { UserId = 0 };
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.AddAddressAsync(address, 1));
        }

        [Fact]
        public async Task AddAddressAsync_ShouldHandleMultipleExistingDefaults()
        {
            var address = new Address { UserId = 1 };
            var existing = new List<Address>
            {
                new Address { IsDefault = true },
                new Address { IsDefault = true }
            };
            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(1)).ReturnsAsync(existing);

            await _service.AddAddressAsync(address, 1);

            Assert.False(address.IsDefault);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldWork_WhenExistingListEmpty()
        {
            var address = new Address { UserId = 1, IsDefault = true };
            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);

            Assert.True(address.IsDefault);
        }


        [Fact]
        public async Task DeleteAddressAsync_ShouldThrow_WhenAddressNotFound()
        {
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync((Address?)null);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAddressAsync(1));
        }

        [Fact]
        public async Task DeleteAddressAsync_ShouldThrow_WhenAlreadyDeleted()
        {
            var addr = new Address { AddressId = 1, IsDeleted = true };
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync(addr);
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAddressAsync(1));
        }

        [Fact]
        public async Task DeleteAddressAsync_ShouldCallRepository_WhenValid()
        {
            var addr = new Address { AddressId = 1, IsDeleted = false };
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync(addr);

            await _service.DeleteAddressAsync(1);

            _mockRepo.Verify(r => r.DeleteAddressAsync(addr), Times.Once);
        }

        [Fact]
        public async Task DeleteAddressAsync_ShouldNotThrow_WhenValid()
        {
            var address = new Address { AddressId = 1, IsDeleted = false };
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync(address);

            await _service.DeleteAddressAsync(1);
        }


        [Fact]
        public async Task GetAddressesByUserIdAsync_ShouldReturnAddresses()
        {
            var expected = new List<Address> { new Address(), new Address() };
            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(1)).ReturnsAsync(expected);

            var result = await _service.GetAddressesByUserIdAsync(1);

            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetAddressesByUserIdAsync_ShouldReturnEmpty_WhenUserIdInvalid()
        {
            _mockRepo.Setup(r => r.GetAddressesByUserIdAsync(0)).ReturnsAsync(new List<Address>());
            var result = await _service.GetAddressesByUserIdAsync(0);
            Assert.Empty(result);
        }


        [Fact]
        public async Task GetAddressByIdAsync_ShouldReturnAddress_WhenExists()
        {
            var address = new Address { AddressId = 1 };
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync(address);

            var result = await _service.GetAddressByIdAsync(1);

            Assert.Equal(1, result.AddressId);
        }

        [Fact]
        public async Task GetAddressByIdAsync_ShouldReturnNull_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync((Address?)null);

            var result = await _service.GetAddressByIdAsync(1);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetAllAddressesAsync_ShouldReturnAllAddresses()
        {
            var all = new List<Address> { new Address(), new Address(), new Address() };
            _mockRepo.Setup(r => r.GetAllAddressesAsync()).ReturnsAsync(all);

            var result = await _service.GetAllAddressesAsync();

            Assert.Equal(3, result.Count);
        }

        [Fact]
        public async Task GetAllAddressesAsync_ShouldReturnEmptyList_WhenNoAddresses()
        {
            _mockRepo.Setup(r => r.GetAllAddressesAsync()).ReturnsAsync(new List<Address>());

            var result = await _service.GetAllAddressesAsync();

            Assert.Empty(result);
        }


        [Fact]
        public async Task UpdateAddressAsync_ShouldThrow_WhenAddressNotFound()
        {
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1))
                     .ReturnsAsync((Address?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAddressAsync(new Address { AddressId = 1 }));
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldThrow_WhenAddressIsDeleted()
        {
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1))
                     .ReturnsAsync(new Address { AddressId = 1, IsDeleted = true });

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAddressAsync(new Address { AddressId = 1 }));
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldCallUpdate_WhenValid()
        {
            var address = new Address { AddressId = 1, IsDeleted = false };
            _mockRepo.Setup(r => r.GetAddressByIdAsync(1)).ReturnsAsync(address);

            await _service.UpdateAddressAsync(address);

            _mockRepo.Verify(r => r.UpdateAddressAsync(address), Times.Once);
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldPreserveAddressId()
        {
            var address = new Address { AddressId = 99, IsDeleted = false };
            _mockRepo.Setup(r => r.GetAddressByIdAsync(99)).ReturnsAsync(address);

            await _service.UpdateAddressAsync(address);

            Assert.Equal(99, address.AddressId);
        }

        [Fact]
        public async Task GetAddressDefaultByUserId_ShouldThrow_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetAddressDefaultByUserId(1)).ReturnsAsync((Address?)null);
            await Assert.ThrowsAsync<Exception>(() => _service.GetAddressDefaultByUserId(1));
        }

        [Fact]
        public async Task GetAddressDefaultByUserId_ShouldReturnAddress_WhenFound()
        {
            var address = new Address { AddressId = 10, IsDefault = true };
            _mockRepo.Setup(r => r.GetAddressDefaultByUserId(1)).ReturnsAsync(address);

            var result = await _service.GetAddressDefaultByUserId(1);

            Assert.True(result.IsDefault);
        }

        [Fact]
        public async Task GetAddressDefaultByUserId_ShouldThrow_WhenUserIdInvalid()
        {
            await Assert.ThrowsAsync<Exception>(() => _service.GetAddressDefaultByUserId(0));
        }
    }
}
