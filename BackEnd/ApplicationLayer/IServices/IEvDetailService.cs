using Application.DTOs.ItemDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IEvDetailService
    {
        Task<IEnumerable<EvDetailDto>> GetAllAsync(CancellationToken ct = default);
        Task<EvDetailDto?> GetByIdAsync(int itemId, CancellationToken ct = default);
        Task<EvDetailDto> CreateAsync(CreateEvDetailDto dto, CancellationToken ct = default);
        Task<bool> UpdateAsync(int itemId, UpdateEvDetailDto dto, CancellationToken ct = default);
        Task<bool> DeleteAsync(int itemId, CancellationToken ct = default);
    }
}
