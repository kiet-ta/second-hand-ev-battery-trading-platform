using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IEVDetailRepository
    {
        Task<EVDetail?> GetByIdAsync(int itemId, CancellationToken ct = default);
        Task<IEnumerable<EVDetail>> GetAllAsync(CancellationToken ct = default);
        Task AddAsync(EVDetail evDetail, CancellationToken ct = default);
        void Update(EVDetail evDetail);
        Task DeleteAsync(int itemId, CancellationToken ct = default); // physical delete
        Task<bool> ExistsAsync(int itemId, CancellationToken ct = default);
    }
}
