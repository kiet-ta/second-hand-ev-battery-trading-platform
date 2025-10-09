using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class EVDetailService : IEVDetailService
    {
        private readonly IItemRepository _itemRepo;
        private readonly IEVDetailRepository _evRepo;
        //private readonly IUnitOfWork _uow;

        public EVDetailService(IItemRepository itemRepo, IEVDetailRepository evRepo) //, IUnitOfWork uow)
        {
            _itemRepo = itemRepo;
            _evRepo = evRepo;
            //_uow = uow;
        }

        public async Task<EVDetailDto> CreateAsync(CreateEvDetailDto dto, CancellationToken ct = default)
        {
            // basic validation (add more as needed)
            if (string.IsNullOrWhiteSpace(dto.Title)) throw new ArgumentException("Title required");

            var item = new Item
            {
                ItemType = "EV",
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                Status = dto.Status,
                UpdatedBy = dto.UpdatedBy,
                //CreatedAt = DateTime.UtcNow,
                //UpdatedAt = DateTime.UtcNow
            };

            await _itemRepo.AddAsync(item, ct);
            await _itemRepo.SaveChangesAsync(); // Save to get ItemId if DB generates it
            var ev = new EVDetail
            {
                ItemId = item.ItemId, // IMPORTANT: if using DB identity, ItemId won't be populated until SaveChanges.
                Brand = dto.Brand,
                Model = dto.Model,
                Version = dto.Version,
                Year = dto.Year,
                BodyStyle = dto.BodyStyle,
                Color = dto.Color,
                LicensePlate = dto.LicensePlate,
                HasAccessories = dto.HasAccessories,
                PreviousOwners = dto.PreviousOwners,
                IsRegistrationValid = dto.IsRegistrationValid,
                Mileage = dto.Mileage,
                //UpdatedAt = DateTime.UtcNow
            };

            // If ItemId identity is generated on DB, you must SaveChanges() after AddAsync(item) to get item.ItemId.
            // Approach: save once now, then add ev detail, then save again.
            await _itemRepo.SaveChangesAsync();

            ev.ItemId = item.ItemId;
            await _evRepo.AddAsync(ev, ct);
            try
            {
                await _itemRepo.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                // handle duplicate license plate or other DB constraints
                throw new InvalidOperationException("Duplicate license plate or DB constraint violation.", ex);
            }

            return MapToDto(ev, item);
        }

        public async Task<bool> DeleteAsync(int itemId, CancellationToken ct = default)
        {
            if (!await _evRepo.ExistsAsync(itemId, ct)) return false;

            await _evRepo.DeleteAsync(itemId, ct);
            await _itemRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<EVDetailDto>> GetAllAsync(CancellationToken ct = default)
        {
            var evs = await _evRepo.GetAllAsync(ct);
            var result = new List<EVDetailDto>();
            foreach (var e in evs)
            {
                var item = await _itemRepo.GetByIdAsync(e.ItemId, ct);
                result.Add(MapToDto(e, item));
            }
            return result;
        }

        public async Task<EVDetailDto?> GetByIdAsync(int itemId, CancellationToken ct = default)
        {
            var e = await _evRepo.GetByIdAsync(itemId, ct);
            if (e == null) return null;
            var item = await _itemRepo.GetByIdAsync(itemId, ct);
            return MapToDto(e, item);
        }

        public async Task<bool> UpdateAsync(int itemId, UpdateEvDetailDto dto, CancellationToken ct = default)
        {
            var existing = await _evRepo.GetByIdAsync(itemId, ct);
            if (existing == null) return false;

            // update fields that are not null in DTO
            if (dto.Brand != null) existing.Brand = dto.Brand;
            if (dto.Model != null) existing.Model = dto.Model;
            if (dto.Version != null) existing.Version = dto.Version;
            if (dto.Year.HasValue) existing.Year = dto.Year.Value;
            if (dto.BodyStyle != null) existing.BodyStyle = dto.BodyStyle;
            if (dto.Color != null) existing.Color = dto.Color;
            if (dto.LicensePlate != null) existing.LicensePlate = dto.LicensePlate;
            if (dto.HasAccessories.HasValue) existing.HasAccessories = dto.HasAccessories.Value;
            if (dto.PreviousOwners.HasValue) existing.PreviousOwners = dto.PreviousOwners.Value;
            if (dto.IsRegistrationValid.HasValue) existing.IsRegistrationValid = dto.IsRegistrationValid.Value;
            if (dto.Mileage.HasValue) existing.Mileage = dto.Mileage.Value;
            //existing.UpdatedAt = DateTime.UtcNow;

            _evRepo.Update(existing);

            // update Item fields if supplied
            if (dto.Title != null || dto.Price.HasValue || dto.Quantity.HasValue || dto.Status != null)
            {
                var item = await _itemRepo.GetByIdAsync(itemId, ct);
                if (item != null)
                {
                    if (dto.Title != null) item.Title = dto.Title;
                    if (dto.Price.HasValue) item.Price = dto.Price;
                    if (dto.Quantity.HasValue) item.Quantity = dto.Quantity.Value;
                    if (dto.Status != null) item.Status = dto.Status;
                    //item.UpdatedAt = DateTime.UtcNow;
                    _itemRepo.Update(item);
                }
            }

            try
            {
                await _itemRepo.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                throw new InvalidOperationException("Duplicate license plate or DB constraint violation.", ex);
            }

            return true;
        }

        private static EVDetailDto MapToDto(EVDetail e, Item? item)
            => new EVDetailDto
            {
                ItemId = e.ItemId,
                Brand = e.Brand,
                Model = e.Model,
                Version = e.Version,
                Year = e.Year,
                BodyStyle = e.BodyStyle,
                Color = e.Color,
                LicensePlate = e.LicensePlate,
                HasAccessories = e.HasAccessories ?? false,
                PreviousOwners = e.PreviousOwners,
                IsRegistrationValid = e.IsRegistrationValid ?? false,
                Mileage = e.Mileage,
                Title = item?.Title,
                Price = item?.Price,
                Status = item?.Status
            };

        private bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            // Simplified detection; refine for your DB provider (SQL Server, Postgres) by examining inner exceptions.
            return ex.InnerException?.Message?.Contains("UNIQUE") == true
                || ex.InnerException?.Message?.Contains("duplicate") == true;
        }
    }
}
