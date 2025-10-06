using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IEvDetailRepository
    {
        Task<EvDetail?> GetByIdAsync(int itemId, CancellationToken ct = default);
        Task<IEnumerable<EvDetail>> GetAllAsync(CancellationToken ct = default);
        Task AddAsync(EvDetail evDetail, CancellationToken ct = default);
        void Update(EvDetail evDetail);
        Task DeleteAsync(int itemId, CancellationToken ct = default); // physical delete
        Task<bool> ExistsAsync(int itemId, CancellationToken ct = default);
    }
}
