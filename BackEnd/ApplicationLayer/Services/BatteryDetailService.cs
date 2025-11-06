using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class BatteryDetailService : IBatteryDetailService
    {
        private readonly IBatteryDetailRepository _repository;
        private readonly IItemRepository _itemRepository;

        public BatteryDetailService(IBatteryDetailRepository repository, IItemRepository itemRepository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _itemRepository = itemRepository ?? throw new ArgumentNullException(nameof(itemRepository));
        }

        public async Task<IEnumerable<BatteryDetailDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            if (list == null || !list.Any())
                throw new InvalidOperationException("No battery details found.");

            return list.Select(b => new BatteryDetailDto
            {
                ItemId = b.ItemId,
                Brand = b.Brand,
                Capacity = b.Capacity,
                Voltage = b.Voltage,
                ChargeCycles = b.ChargeCycles,
                UpdatedAt = b.UpdatedAt
            });
        }

        public async Task<BatteryDetailDto?> GetByIdAsync(int itemId)
        {
            var b = await _repository.GetByIdAsync(itemId);
            if (b == null) throw new KeyNotFoundException($"Battery detail with ItemId {itemId} not found.");

            return new BatteryDetailDto
            {
                ItemId = b.ItemId,
                Brand = b.Brand,
                Capacity = b.Capacity,
                Voltage = b.Voltage,
                ChargeCycles = b.ChargeCycles,
                UpdatedAt = b.UpdatedAt
            };
        }

        private static BatteryDetailDto MapToDto(BatteryDetail e, Item? item)
        {
            if (e == null) throw new ArgumentNullException(nameof(e));

            return new BatteryDetailDto
            {
                ItemId = e.ItemId,
                Brand = e.Brand,
                Capacity = e.Capacity,
                Voltage = e.Voltage,
                ChargeCycles = e.ChargeCycles,
                Title = item?.Title,
                Price = item?.Price,
                Status = item?.Status
            };
        }

        public async Task<BatteryDetailDto> CreateAsync(CreateBatteryDetailDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var item = new Item
            {
                ItemType = "battery",
                CategoryId = dto.CategoryId,
                Title = dto.Title ?? throw new ArgumentException("Title cannot be null.", nameof(dto.Title)),
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                Status = dto.Status,
                UpdatedBy = dto.UpdatedBy,
                //CreatedAt = DateTime.Now,
                //UpdatedAt = DateTime.Now
            };

            await _itemRepository.AddAsync(item);
            await _itemRepository.SaveChangesAsync(); // Save to get ItemId if DB generates it

            var entity = new BatteryDetail
            {
                ItemId = item.ItemId,
                Brand = dto.Brand ?? throw new ArgumentException("Brand cannot be null.", nameof(dto.Brand)),
                Capacity = dto.Capacity,
                Voltage = dto.Voltage,
                ChargeCycles = dto.ChargeCycles,
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
            return MapToDto(entity, item);
        }

        public async Task UpdateAsync(int itemId, UpdateBatteryDetailDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var existing = await _repository.GetByIdAsync(itemId)
                ?? throw new KeyNotFoundException($"Battery detail with ItemId {itemId} not found.");

            existing.Brand = dto.Brand ?? throw new ArgumentException("Brand cannot be null.", nameof(dto.Brand));
            existing.Capacity = dto.Capacity;
            existing.Voltage = dto.Voltage;
            existing.ChargeCycles = dto.ChargeCycles;
            //existing.UpdatedAt = DateTime.Now;

            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int itemId)
        {
            var existing = await _repository.GetByIdAsync(itemId)
                ?? throw new KeyNotFoundException($"Battery detail with ItemId {itemId} not found.");

            await _repository.DeleteAsync(itemId);
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<ItemDto>> GetLatestBatteriesAsync(int count)
        {
            var items = await _repository.GetLatestBatteriesAsync(count);
            if (items == null)
                throw new Exception("No battery items found.");
            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _itemRepository.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Moderation = item.Moderation,

                    Quantity = item.Quantity,
                    //Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    //IsDeleted = item.IsDeleted,
                    Images = images.Select(img => new ItemImageDto
                    {
                        ImageId = img.ImageId,
                        ImageUrl = img.ImageUrl
                    }).ToList()
                });
            }

            return result;
        }

        public async Task<IEnumerable<BatteryDetailDto>> SearchBatteryDetailAsync(BatterySearchRequestDto request)
        {
            var result = await _itemRepository.SearchBatteryDetailAsync(request);
            return result.Select(e => new BatteryDetailDto
            {
                ItemId = e.ItemId,
                Brand = e.Brand,
                Capacity = e.Capacity,
                Voltage = e.Voltage,
                ChargeCycles = e.ChargeCycles
            });
        }
    }
}
