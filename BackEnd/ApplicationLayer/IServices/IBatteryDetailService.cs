using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IBatteryDetailService 
    {
        Task<IEnumerable<BatteryDetailDto>> GetAllAsync();
        Task<BatteryDetailDto?> GetByIdAsync(int itemId);
        Task<BatteryDetailDto> CreateAsync(CreateBatteryDetailDto dto);
        Task UpdateAsync(int itemId, UpdateBatteryDetailDto dto);
        Task DeleteAsync(int itemId);
        Task<IEnumerable<ItemDto>> GetLatestBatteriesAsync(int count);
        Task<IEnumerable<BatteryDetailDto>> SearchBatteryDetailAsync(BatterySearchRequestDto request);
    }
}
