using Application.DTOs.ItemDtos;
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
                        where !(i.IsDeleted == true)   // remove soft deleted items
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

        }

        public async Task<Item> AddAsync(Item item, CancellationToken ct = default)
        {
            var en = (await _context.Items.AddAsync(item, ct)).Entity;
            return en;
        }

        public void Delete(Item item)
        {
            // I fixed here because Update() will mark the whole entity as Modified → if the service only has IsDeleted = true set then it's OK, but if the entity is being tracked, it might override other fields.
            //item.IsDeleted = true;
            //_context.Items.Update(item); // xóa mềm

            item.IsDeleted = true;
            _context.Entry(item).Property(x => x.IsDeleted).IsModified = true;
        }

        public async Task<IEnumerable<Item>> GetAllAsync() =>
            await _context.Items.Where(i => !(i.IsDeleted == true)).ToListAsync();
        public async Task<Item?> GetByIdAsync(int itemId, CancellationToken ct = default)
            => await _context.Items.FindAsync(new object[] { itemId }, ct);

        public void Update(Item item) => _context.Items.Update(item);

        public async Task<IEnumerable<Item>> GetItemsByFilterAsync(CancellationToken ct = default)
            => await _context.Items.Where(i => !(i.IsDeleted == true)).ToListAsync(ct);
        public async Task<bool> ExistsAsync(int itemId, CancellationToken ct = default)
            => await _context.Items.AnyAsync(i => i.ItemId == itemId, ct);

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

        public async Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id)
        {
            var query = from i in _context.Items
                        where i.ItemId == id && !(i.IsDeleted == true)
                        join ev in _context.EvDetails
                            on i.ItemId equals ev.ItemId into evj
                        from evDetail in evj.DefaultIfEmpty()
                        join bat in _context.BatteryDetails
                            on i.ItemId equals bat.ItemId into batj
                        from batDetail in batj.DefaultIfEmpty()
                        select new ItemWithDetailDto
                        {
                            ItemId = i.ItemId,
                            Title = i.Title,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            UpdatedBy = i.UpdatedBy,
                            EVDetail = evDetail,
                            BatteryDetail = batDetail
                        };

            return await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync()
        {
            var query = from i in _context.Items
                        where !(i.IsDeleted == true)
                        join ev in _context.EvDetails
                            on i.ItemId equals ev.ItemId into evj
                        from evDetail in evj.DefaultIfEmpty()
                        join bat in _context.BatteryDetails
                            on i.ItemId equals bat.ItemId into batj
                        from batDetail in batj.DefaultIfEmpty()
                        select new ItemWithDetailDto
                        {
                            ItemId = i.ItemId,
                            Title = i.Title,
                            ItemType = i.ItemType,
                            CategoryId = i.CategoryId,
                            Description = i.Description,
                            Price = i.Price,
                            Quantity = i.Quantity,
                            CreatedAt = i.CreatedAt,
                            UpdatedAt = i.UpdatedAt,
                            UpdatedBy = i.UpdatedBy,
                            EVDetail = evDetail,
                            BatteryDetail = batDetail
                        };

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId)
        {
            // Query original
            var query = from payment in _context.Payments
                        join pd in _context.PaymentDetails on payment.PaymentId equals pd.PaymentId
                        join item in _context.Items on pd.ItemId equals item.ItemId
                        where payment.UserId == userId && payment.Status == "completed"
                        select new
                        {
                            payment,
                            pd,
                            item
                        };

            // build result detail (join EV & Battery)
            var result = await (from q in query
                                    // left join EV_Detail
                                join ev in _context.EvDetails
                                    on q.item.ItemId equals ev.ItemId into evJoin
                                from ev in evJoin.DefaultIfEmpty()
                                    // left join Battery_Detail
                                join bat in _context.BatteryDetails
                                    on q.item.ItemId equals bat.ItemId into batJoin
                                from bat in batJoin.DefaultIfEmpty()
                                select new ItemBoughtDto
                                {
                                    ItemId = q.item.ItemId,
                                    ItemType = q.item.ItemType,
                                    Title = q.item.Title,
                                    Description = q.item.Description,
                                    Price = q.item.Price,

                                    PaymentId = q.payment.PaymentId,
                                    OrderCode = q.payment.OrderCode,
                                    TotalAmount = q.payment.TotalAmount,
                                    Method = q.payment.Method,
                                    Status = q.payment.Status,
                                    PaymentCreatedAt = q.payment.CreatedAt,

                                    // EV
                                    Brand = ev.Brand,
                                    Model = ev.Model,
                                    Version = ev.Version,
                                    Year = ev.Year,
                                    Color = ev.Color,
                                    Mileage = ev.Mileage,

                                    // Battery
                                    Capacity = bat.Capacity,
                                    Voltage = bat.Voltage,
                                    ChargeCycles = bat.ChargeCycles,

                                    // Amount of item
                                    ItemAmount = q.pd.Amount
                                }).ToListAsync();

            return result;
        }

        //Feature: Seller Dashboard
        public async Task<int> CountAllBySellerAsync(int sellerId)
        {
            return await _context.Items.CountAsync(i => i.UpdatedBy == sellerId && !(i.IsDeleted == true));
        }

        public async Task<int> CountByStatusAsync(int sellerId, string status)
        {
            return await _context.Items.CountAsync(i => i.UpdatedBy == sellerId && i.Status == status && !(i.IsDeleted == true));
        }

        public async Task<decimal> GetTotalRevenueAsync(int sellerId)
        {
            return await _context.PaymentDetails
                .Where(p => _context.Items
                    .Any(i => i.ItemId == p.ItemId && i.UpdatedBy == sellerId))
                .SumAsync(p => p.Amount);
        }
    }
}
