using Infrastructure.Data;
using Application.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ItemRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Item item) => await _context.Items.AddAsync(item);

        public void Delete(Item item)
        {
            item.IsDeleted = true;
            _context.Items.Update(item); // xóa mềm
        }

        public async Task<IEnumerable<Item>> GetAllAsync() =>
            await _context.Items.Where(i => !(i.IsDeleted ?? false)).ToListAsync();

        public async Task<Item?> GetByIdAsync(int id) =>
            await _context.Items.FirstOrDefaultAsync(i => i.ItemId == id && !(i.IsDeleted ?? false));

        public void Update(Item item) => _context.Items.Update(item);

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<IEnumerable<Item>> GetLatestEVsAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "EV" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
        public async Task<IEnumerable<Item>> GetLatestBatterysAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "Battery" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
