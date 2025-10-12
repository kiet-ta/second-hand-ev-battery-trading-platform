using Application.DTOs;
using Application.DTOs.ItemDtos;
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

            var sold = await GetSoldItemsAsync(sellerId);
            var pending = await GetPendingPaymentItemsAsync(sellerId);
            var processing = await GetProcessingItemsAsync(sellerId);
            var canceled = await GetCanceledItemsAsync(sellerId);


            var allItems = await _repository.GetAllSellerItemsAsync(sellerId);

            var takenIds = new HashSet<int>(
    sold.Select(i => (int)((dynamic)i).ItemId)
        .Concat(pending.Select(i => (int)((dynamic)i).ItemId))
        .Concat(processing.Select(i => (int)((dynamic)i).ItemId))
        .Concat(canceled.Select(i => (int)((dynamic)i).ItemId))
);


            var availableItems = allItems.Where(i => !takenIds.Contains(i.ItemId)).ToList();
            var mappedAvailable = await MapItemsAsync(availableItems);


            foreach (var obj in mappedAvailable)
            {
                if (obj is BatteryItemDto battery)
                    battery.Status = "available";
                else if (obj is EVItemDto ev)
                    ev.Status = "available";
            }


            var finalList = new List<object>();
            finalList.AddRange(sold);
            finalList.AddRange(pending);
            finalList.AddRange(processing);
            finalList.AddRange(canceled);
            finalList.AddRange(mappedAvailable);

            return finalList;
        }


        public async Task<List<object>> GetProcessingItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetProcessingItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            var mappedItems = await MapItemsAsync(items);

            foreach (var obj in mappedItems)
            {
                if (obj is BatteryItemDto battery)
                    battery.Status = "processing";
                else if (obj is EVItemDto ev)
                    ev.Status = "processing";
            }

            return mappedItems;
        }

        public async Task<List<object>> GetPendingPaymentItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetPendingPaymentItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            var mappedItems = await MapItemsAsync(items);

            foreach (var obj in mappedItems)
            {
                if (obj is BatteryItemDto battery)
                    battery.Status = "pending_approval";
                else if (obj is EVItemDto ev)
                    ev.Status = "pending_approval";
            }

            return mappedItems;
        }

        public async Task<List<object>> GetSoldItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetSoldItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            var mappedItems = await MapItemsAsync(items);

            foreach (var obj in mappedItems)
            {
                if (obj is BatteryItemDto battery)
                    battery.Status = "sold";
                else if (obj is EVItemDto ev)
                    ev.Status = "sold";
            }

            return mappedItems;
        }
        public async Task<List<object>> GetCanceledItemsAsync(int sellerId)
        {
            var seller = await _repository.GetSellerByIdAsync(sellerId);
            if (seller == null)
                throw new KeyNotFoundException("Seller not found");

            var items = await _repository.GetCanceledItemsAsync(sellerId);
            if (items == null || !items.Any())
                return new List<object>();

            var mappedItems = await MapItemsAsync(items);

            foreach (var obj in mappedItems)
            {
                if (obj is BatteryItemDto battery)
                    battery.Status = "canceled";
                else if (obj is EVItemDto ev)
                    ev.Status = "canceled";
            }

            return mappedItems;
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

