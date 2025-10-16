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


        public async Task AddAddressAsync(Address address)
        {
            address.IsDeleted = false;

            var existingAddresses = await _addressRepository.GetAddressesByUserIdAsync(address.UserId);

            if (existingAddresses.Any(a => (a.IsDefault == true)))
            {
                address.IsDefault = false;
            }

            await _addressRepository.AddAddressAsync(address);
        }

     
        public async Task DeleteAddressAsync(int addressId)
        {
            var existing = await _addressRepository.GetAddressByIdAsync(addressId);
            if (existing == null || (existing.IsDeleted == true))
            {
                throw new KeyNotFoundException("Address does not exist");
            }

            await _addressRepository.DeleteAddressAsync(existing);
        }

        public Task<List<Address>> GetAddressesByUserIdAsync(int userId)
        {
            return _addressRepository.GetAddressesByUserIdAsync(userId);
        }

        public Task<Address?> GetAddressByIdAsync(int addressId)
        {
            return _addressRepository.GetAddressByIdAsync(addressId);
        }

        public Task<List<Address>> GetAllAddressesAsync()
        {
            return _addressRepository.GetAllAddressesAsync();
        }

        public async Task UpdateAddressAsync(Address address)
        {
            var existing = await _addressRepository.GetAddressByIdAsync(address.AddressId);
            if (existing == null || (existing.IsDeleted == true))
            {
                throw new KeyNotFoundException("Address does not exist");
            }

            await _addressRepository.UpdateAddressAsync(address);
        }

    }
}
