using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class HistorySoldService : IHistorySoldService
    {
        private readonly IHistorySoldRepository _repository;

        public HistorySoldService(IHistorySoldRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<object>> GetAllSellerItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                return new List<object>();

            var items = await _repository.GetAllSellerItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            return await MapItemsAsync(items);
        }

        public async Task<List<object>> GetProcessingItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetProcessingItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            return await MapItemsAsync(items);
        }

        public async Task<List<object>> GetPendingPaymentItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetPendingPaymentItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            return await MapItemsAsync(items);
        }

        public async Task<List<object>> GetSoldPaymentItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetSoldItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            return await MapItemsAsync(items);
        }

        private async Task<List<object>> MapItemsAsync(List<Item> items)
        {
            var result = new List<object>();

            var batteryItems = items.Where(i => i.ItemType == "battery").ToList();
            if (batteryItems.Any())
            {
                var mappedBatteryItems = await _repository.MapToBatteryItemsAsync(batteryItems);
                if (mappedBatteryItems != null && mappedBatteryItems.Any())
                    result.AddRange(mappedBatteryItems);
            }

            var evItems = items.Where(i => i.ItemType == "ev").ToList();
            if (evItems.Any())
            {
                var mappedEVItems = await _repository.MapToEVItemsAsync(evItems);
                if (mappedEVItems != null && mappedEVItems.Any())
                    result.AddRange(mappedEVItems);
            }

            return result;
        }
    }
}
