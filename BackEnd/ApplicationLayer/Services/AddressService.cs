using Application.IRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IAddressRepository _addressRepository;

        public AddressService(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        // ✅ Add Address
        public async Task AddAddressAsync(Address address)
        {
            address.IsDeleted = false;

            var existingAddresses = await _addressRepository.GetAddressesByUserIdAsync(address.UserId);

            if (existingAddresses.Any(a => a.IsDefault))
            {
                address.IsDefault = false;
            }

            await _addressRepository.AddAddressAsync(address);
        }

        // ✅ Delete Address 
        public async Task DeleteAddressAsync(int addressId)
        {
            var existing = await _addressRepository.GetAddressByIdAsync(addressId);
            if (existing == null || existing.IsDeleted)
            {
                throw new KeyNotFoundException("Address does not exist");
            }

            await _addressRepository.DeleteAddressAsync(existing);
        }

        // ✅ Get all addresses of a user
        public Task<List<Address>> GetAddressesByUserIdAsync(int userId)
        {
            return _addressRepository.GetAddressesByUserIdAsync(userId);
        }

        // ✅ Get address by id
        public Task<Address?> GetAddressByIdAsync(int addressId)
        {
            return _addressRepository.GetAddressByIdAsync(addressId);
        }

        // ✅ Get all addresses
        public Task<List<Address>> GetAllAddressesAsync()
        {
            return _addressRepository.GetAllAddressesAsync();
        }

        // ✅ Update address
        public async Task UpdateAddressAsync(Address address)
        {
            var existing = await _addressRepository.GetAddressByIdAsync(address.AddressId);
            if (existing == null || existing.IsDeleted)
            {
                throw new KeyNotFoundException("Address does not exist");
            }

            await _addressRepository.UpdateAddressAsync(address);
        }
    }
}
