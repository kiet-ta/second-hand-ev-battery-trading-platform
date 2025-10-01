using Application.DTOs;
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
    public class ItemRepository : IItemRepository
    {
        private readonly EvBatteryTradingContext _context;

        public ItemRepository(EvBatteryTradingContext context) => _context = context;

        public IQueryable<Item> Query() => _context.Items.AsQueryable();

        public IQueryable<ItemDto> QueryItemsWithSeller()
        {
            // EF will understand navigation from Configurations
            var query = from i in _context.Items
                        join u in _context.Users
                            on i.UpdatedBy equals u.UserId into gj
                        from user in gj.DefaultIfEmpty() // LEFT JOIN
                        where !(i.IsDeleted ?? false)   // remove soft deleted items
                        select new ItemDto
                        {
                            ItemId = i.ItemId,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Title = i.Title,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity ?? 0,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt
                            //UpdatedBy = i.UpdatedBy,
                            //SellerName = user != null
                            //? (user.FullName ?? string.Empty)
                            //: string.Empty
                        };

            return query.AsNoTracking(); // Optimized for read-only queries

            //return _context.Items
            //    .Where(i => !(i.IsDeleted ?? false))
            //    //.Include(i => i.UpdatedByUser) // nếu cần navigation
            //    .AsNoTracking();

        }

        public async Task AddAsync(Item item) => await _context.Items.AddAsync(item);

        public void Delete(Item item)
        {
            // I fixed here because Update() will mark the whole entity as Modified → if the service only has IsDeleted = true set then it's OK, but if the entity is being tracked, it might override other fields.
            //item.IsDeleted = true;
            //_context.Items.Update(item); // xóa mềm

            item.IsDeleted = true;
            _context.Entry(item).Property(x => x.IsDeleted).IsModified = true;
        }

        public async Task<IEnumerable<Item>> GetAllAsync() =>
            await _context.Items.Where(i => !(i.IsDeleted ?? false)).ToListAsync();

        public async Task<Item?> GetByIdAsync(int id) =>
            await _context.Items.FirstOrDefaultAsync(i => i.ItemId == id && !(i.IsDeleted ?? false));

        public void Update(Item item) => _context.Items.Update(item);

        //ChatGPT recommended me to use IUnitOfWork instance of SaveChangesAsync
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync(); 

        public async Task<IEnumerable<Item>> GetLatestEVsAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "EV" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
        public async Task<IEnumerable<Item>> GetLatestBatteriesAsync(int count)
        {
            return await _context.Items
                .Where(x => x.ItemType == "Battery" && !(x.IsDeleted == true))
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
