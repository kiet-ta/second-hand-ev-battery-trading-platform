using Application.DTOs.AuthenticationDtos;
using Application.DTOs.GhnDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly EvBatteryTradingContext _context;
        private readonly GhnSettings _appSettings;

        public AddressRepository(EvBatteryTradingContext context, IOptionsMonitor<GhnSettings> appSettings)
        {
            _context = context;
            _appSettings = appSettings.CurrentValue;
        }

        public async Task AddAddressAsync(Address address)
        {
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
        }

        public async Task<Address?> GetAddressDefaultByUserId(int userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId && (a.IsDeleted == false) && (a.IsDefault == true))
                .FirstOrDefaultAsync();
        }


        public async Task<List<Address>> GetAddressesByUserIdAsync(int userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId && !(a.IsDeleted))
                .ToListAsync();
        }

        public async Task<Address?> GetAddressByIdAsync(int addressId)
        {
            return await _context.Addresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && !(a.IsDeleted));
        }

        public async Task<List<Address>> GetAllAddressesAsync()
        {
            return await _context.Addresses
                .Where(a => !(a.IsDeleted))
                .ToListAsync();
        }

        public async Task UpdateAddressAsync(Address address)
        {
            var existing = await _context.Addresses.FindAsync(address.AddressId);
            if (existing == null || (existing.IsDeleted))
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

        public async Task<Address?> GetShopAddressAsync(int userId)
        => await _context.Addresses
            .FirstOrDefaultAsync(a => a.UserId == userId && a.IsShopAddress && !a.IsDeleted);


        public async Task<GhnFeeResponse> CalulateShippingFee(int userId)
        {
            var defaultAddress = await GetAddressDefaultByUserId(userId);
            if (defaultAddress == null)
                throw new Exception("Default address not found");

            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Token", _appSettings.Token);
            client.DefaultRequestHeaders.Add("ShopId", _appSettings.ShopId);

            var payload = new
            {
                service_type_id = 2,
                from_district_id = 1454,
                from_ward_code = "21307",

                to_district_id = defaultAddress.DistrictCode,
                to_ward_code = defaultAddress.WardCode,

                weight = 2000,
                items = new[]
                {
            new { weight = 2000 }
        }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"{_appSettings.Api}/shipping-order/fee";

            var response = await client.PostAsync(url, content);

            var responseJson = await response.Content.ReadAsStringAsync();

            // Deserialize into your DTO
            var result = JsonSerializer.Deserialize<GhnFeeResponse>(responseJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result;
        }

    }
}