using Application.IRepositories;
using Domain.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly EvBatteryTradingContext _context;
        public AddressRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task AddAddressAsync(Address address)
        {
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Address>> GetAddressesByUserIdAsync(int userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId && !(a.IsDeleted==true))
                .ToListAsync();
        }

        public async Task<Address?> GetAddressByIdAsync(int addressId)
        {
            return await _context.Addresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && !(a.IsDeleted == true));
        }

        public async Task<List<Address>> GetAllAddressesAsync()
        {
            return await _context.Addresses
                .Where(a => !(a.IsDeleted == true))
                .ToListAsync();
        }

        public async Task UpdateAddressAsync(Address address)
        {
            var existing = await _context.Addresses.FindAsync(address.AddressId);
            if (existing == null || (existing.IsDeleted == true))
                throw new Exception("Address not found");

            _context.Entry(existing).CurrentValues.SetValues(address);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAddressAsync(Address address)
        {
            address.IsDeleted = true;
            _context.Addresses.Update(address);
            await _context.SaveChangesAsync();
        }
    }
}
