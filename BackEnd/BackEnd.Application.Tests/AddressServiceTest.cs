using Application.IRepositories;
using Application.Services;
using Domain.Entities;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackEnd.Application.Tests
{
    public class AddressServiceTests
    {
        private readonly Mock<IUnitOfWork> _repoMock;
        private readonly AddressService _service;

        public AddressServiceTests()
        {
            _repoMock = new Mock<IUnitOfWork>();
            _service = new AddressService(_repoMock.Object);
        }


        [Fact]
        public async Task AddAddressAsync_ShouldSetIsDeletedFalse()
        {
            var address = new Address { UserId = 1 };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);

            Assert.False(address.IsDeleted);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldSetIsDefaultFalse_WhenExistingDefault()
        {
            var address = new Address { UserId = 1 };
            var existing = new List<Address> { new Address { IsDefault = true } };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(existing);

            await _service.AddAddressAsync(address, 1);

            Assert.False(address.IsDefault);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldKeepIsDefaultTrue_WhenNoExistingDefault()
        {
            var address = new Address { UserId = 1, IsDefault = true };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(new List<Address> { new Address { IsDefault = false } });

            await _service.AddAddressAsync(address, 1);

            Assert.True(address.IsDefault);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldCallAddAddressAsyncOnce()
        {
            var address = new Address { UserId = 1 };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);

            _repoMock.Verify(r => r.Address.AddAddressAsync(address), Times.Once);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldNotThrow_WhenNoExistingAddresses()
        {
            var address = new Address { UserId = 1 };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);
        }


        [Fact]
        public async Task DeleteAddressAsync_ShouldThrow_WhenAddressNotFound()
        {
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(99))
                     .ReturnsAsync((Address)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAddressAsync(99));
        }

        [Fact]
        public async Task DeleteAddressAsync_ShouldThrow_WhenAlreadyDeleted()
        {
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1))
                     .ReturnsAsync(new Address { AddressId = 1, IsDeleted = true });

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAddressAsync(1));
        }

        [Fact]
        public async Task DeleteAddressAsync_ShouldCallRepository_WhenValid()
        {
            var address = new Address { AddressId = 1, IsDeleted = false };
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1)).ReturnsAsync(address);

            await _service.DeleteAddressAsync(1);

            _repoMock.Verify(r => r.Address.DeleteAddressAsync(address), Times.Once);
        }


        [Fact]
        public async Task GetAddressesByUserIdAsync_ShouldReturnList()
        {
            var list = new List<Address> { new Address(), new Address() };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(list);

            var result = await _service.GetAddressesByUserIdAsync(1);

            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetAddressByIdAsync_ShouldReturnAddress()
        {
            var address = new Address { AddressId = 1 };
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1)).ReturnsAsync(address);

            var result = await _service.GetAddressByIdAsync(1);

            Assert.Equal(1, result.AddressId);
        }

        [Fact]
        public async Task GetAddressByIdAsync_ShouldReturnNull_WhenNotFound()
        {
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1)).ReturnsAsync((Address)null);

            var result = await _service.GetAddressByIdAsync(1);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetAllAddressesAsync_ShouldReturnAllAddresses()
        {
            var all = new List<Address> { new Address(), new Address(), new Address() };
            _repoMock.Setup(r => r.Address.GetAllAddressesAsync()).ReturnsAsync(all);

            var result = await _service.GetAllAddressesAsync();

            Assert.Equal(3, result.Count);
        }

        [Fact]
        public async Task GetAllAddressesAsync_ShouldReturnEmptyList_WhenNoAddresses()
        {
            _repoMock.Setup(r => r.Address.GetAllAddressesAsync()).ReturnsAsync(new List<Address>());

            var result = await _service.GetAllAddressesAsync();

            Assert.Empty(result);
        }


        [Fact]
        public async Task UpdateAddressAsync_ShouldThrow_WhenAddressNotFound()
        {
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1))
                     .ReturnsAsync((Address)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAddressAsync(new Address { AddressId = 1 }));
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldThrow_WhenAddressIsDeleted()
        {
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1))
                     .ReturnsAsync(new Address { AddressId = 1, IsDeleted = true });

            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAddressAsync(new Address { AddressId = 1 }));
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldCallUpdate_WhenValid()
        {
            var address = new Address { AddressId = 1, IsDeleted = false };
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1)).ReturnsAsync(address);

            await _service.UpdateAddressAsync(address);

            _repoMock.Verify(r => r.Address.UpdateAddressAsync(address), Times.Once);
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldNotThrow_WhenValid()
        {
            var address = new Address { AddressId = 1, IsDeleted = false };
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1)).ReturnsAsync(address);

            await _service.UpdateAddressAsync(address);
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
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(existing);

            await _service.AddAddressAsync(address, 1);

            Assert.False(address.IsDefault);
        }

        [Fact]
        public async Task AddAddressAsync_ShouldWork_WhenExistingListEmpty()
        {
            var address = new Address { UserId = 1, IsDefault = true };
            _repoMock.Setup(r => r.Address.GetAddressesByUserIdAsync(1))
                     .ReturnsAsync(new List<Address>());

            await _service.AddAddressAsync(address, 1);

            Assert.True(address.IsDefault);
        }

        [Fact]
        public async Task DeleteAddressAsync_ShouldNotThrow_WhenValid()
        {
            var address = new Address { AddressId = 1, IsDeleted = false };
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(1)).ReturnsAsync(address);

            await _service.DeleteAddressAsync(1);
        }

        [Fact]
        public async Task UpdateAddressAsync_ShouldPreserveAddressId()
        {
            var address = new Address { AddressId = 99 };
            _repoMock.Setup(r => r.Address.GetAddressByIdAsync(99)).ReturnsAsync(address);

            await _service.UpdateAddressAsync(address);

            Assert.Equal(99, address.AddressId);
        }
    }
}

