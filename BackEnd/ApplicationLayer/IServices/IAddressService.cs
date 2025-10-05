using Domain.Entities;

namespace Application.IServices
{
    public interface IAddressService
    {
        Task AddAddressAsync(Address address);
        Task DeleteAddressAsync(int addressId);
        Task<List<Address>> GetAddressesByUserIdAsync(int userId);
        Task<Address?> GetAddressByIdAsync(int addressId);
        Task<List<Address>> GetAllAddressesAsync();
        Task UpdateAddressAsync(Address address);
    }
}
