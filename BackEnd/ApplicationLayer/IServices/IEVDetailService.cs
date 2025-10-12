using Application.DTOs.ItemDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IEVDetailService
    {
        Task<IEnumerable<EVDetailDto>> GetAllAsync(CancellationToken ct = default);
        Task<EVDetailDto?> GetByIdAsync(int itemId, CancellationToken ct = default);
        Task<EVDetailDto> CreateAsync(CreateEvDetailDto dto, CancellationToken ct = default);
        Task<bool> UpdateAsync(int itemId, UpdateEvDetailDto dto, CancellationToken ct = default);
        Task<bool> DeleteAsync(int itemId, CancellationToken ct = default);
    }
}
