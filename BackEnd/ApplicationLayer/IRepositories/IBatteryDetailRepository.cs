using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IBatteryDetailRepository
    {
        Task<IEnumerable<BatteryDetail>> GetAllAsync();
        Task<BatteryDetail?> GetByIdAsync(int itemId);
        Task AddAsync(BatteryDetail batteryDetail);
        Task UpdateAsync(BatteryDetail batteryDetail);
        Task DeleteAsync(int itemId);
        Task SaveChangesAsync();
    }
}
