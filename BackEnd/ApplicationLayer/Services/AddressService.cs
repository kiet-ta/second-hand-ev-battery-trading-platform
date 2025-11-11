using Application.IRepositories;
using Application.IServices;
using Domain.Entities;

namespace Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AddressService(IUnitOfWork unitOfWork)
        {
           _unitOfWork = unitOfWork;
        }


        public async Task AddAddressAsync(Address address, int currentUserId)
        {
            if (address.UserId != currentUserId)
                throw new UnauthorizedAccessException("You are not allowed to add address for other users.");

            address.IsDeleted = false;

            var existingAddresses = await _unitOfWork.Address.GetAddressesByUserIdAsync(address.UserId);

            if (existingAddresses.Any(a => (bool)a.IsDefault))
                address.IsDefault = false;

            await _unitOfWork.Address.AddAddressAsync(address);
        }



        public async Task DeleteAddressAsync(int addressId)
        {
            var existing = await _unitOfWork.Address.GetAddressByIdAsync(addressId);
            if (existing == null || (existing.IsDeleted == true))
            {
                throw new KeyNotFoundException("Address does not exist");
            }

            await _unitOfWork.Address.DeleteAddressAsync(existing);
        }

        public Task<List<Address>> GetAddressesByUserIdAsync(int userId)
        {
            return _unitOfWork.Address.GetAddressesByUserIdAsync(userId);
        }

        public Task<Address?> GetAddressByIdAsync(int addressId)
        {
            return _unitOfWork.Address.GetAddressByIdAsync(addressId);
        }

        public Task<List<Address>> GetAllAddressesAsync()
        {
            return _unitOfWork.Address.GetAllAddressesAsync();
        }

        public async Task UpdateAddressAsync(Address address)
        {
            var existing = await _unitOfWork.Address.GetAddressByIdAsync(address.AddressId);
            if (existing == null || (existing.IsDeleted == true))
            {
                throw new KeyNotFoundException("Address does not exist");
            }

            await _unitOfWork.Address.UpdateAddressAsync(address);
        }
        public async Task<Address> GetAddressDefaultByUserId(int userId)
        {
            var address = await _unitOfWork.Address.GetAddressDefaultByUserId(userId);

            if (address == null)
            {
                throw new Exception($"No default address found for user with ID {userId}.");
            }

            return address;
        }
    }
}
