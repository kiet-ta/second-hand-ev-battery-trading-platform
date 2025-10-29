using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class BatteryDetailRepository : IBatteryDetailRepository
    {
        private readonly EvBatteryTradingContext _context;

        public BatteryDetailRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BatteryDetail>> GetAllAsync()
        {
            return await _context.BatteryDetails.AsNoTracking().ToListAsync();
        }

        public async Task<BatteryDetail?> GetByIdAsync(int itemId)
        {
            return await _context.BatteryDetails.FindAsync(itemId);
        }

        public async Task AddAsync(BatteryDetail batteryDetail)
        {
            await _context.BatteryDetails.AddAsync(batteryDetail);
        }

        public async Task UpdateAsync(BatteryDetail batteryDetail)
        {
            _context.BatteryDetails.Update(batteryDetail);
        }

        public async Task DeleteAsync(int itemId)
        {
            var entity = await _context.BatteryDetails.FindAsync(itemId);
            if (entity != null)
                _context.BatteryDetails.Remove(entity);
        }

        public async Task<IEnumerable<Item>> GetLatestBatteriesAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "Battery" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
