using Domain.Entities;

namespace Application.IRepositories
{
    public interface IAddressRepository
    {
        Task AddAddressAsync(Address address);
        Task<List<Address>> GetAddressesByUserIdAsync(int userId);
        Task<Address?> GetAddressByIdAsync(int addressId);
        Task<List<Address>> GetAllAddressesAsync();
        Task UpdateAddressAsync(Address address);
        Task DeleteAddressAsync(Address address);
        Task<Address?> GetAddressDefaultByUserId(int userId);
        Task<Address?> GetShopAddressAsync(int userId);
    }
}
