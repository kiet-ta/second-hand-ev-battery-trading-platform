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

        public BatteryDetailService(IBatteryDetailRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<BatteryDetailDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
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
            if (b == null) return null;

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

        public async Task CreateAsync(CreateBatteryDetailDto dto)
        {
            var entity = new BatteryDetail
            {
                ItemId = dto.ItemId,
                Brand = dto.Brand,
                Capacity = dto.Capacity,
                Voltage = dto.Voltage,
                ChargeCycles = dto.ChargeCycles,
                //UpdatedAt = DateTime.Now
            };

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(int itemId, UpdateBatteryDetailDto dto)
        {
            var existing = await _repository.GetByIdAsync(itemId);
            if (existing == null) return;

            existing.Brand = dto.Brand;
            existing.Capacity = dto.Capacity;
            existing.Voltage = dto.Voltage;
            existing.ChargeCycles = dto.ChargeCycles;
            //existing.UpdatedAt = DateTime.Now;

            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int itemId)
        {
            await _repository.DeleteAsync(itemId);
            await _repository.SaveChangesAsync();
        }
    }
}
