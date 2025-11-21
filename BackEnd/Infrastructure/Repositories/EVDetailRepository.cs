using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Domain.Common.Constants;
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
    public class EVDetailRepository : IEVDetailRepository
    {
        private readonly EvBatteryTradingContext _ctx;

        public EVDetailRepository(EvBatteryTradingContext ctx) => _ctx = ctx;

        public async Task AddAsync(EVDetail evDetail, CancellationToken ct = default)
        {
            await _ctx.EVDetails.AddAsync(evDetail, ct);
        }

        public async Task DeleteAsync(int itemId, CancellationToken ct = default)
        {
            var e = await _ctx.EVDetails.FindAsync(new object[] { itemId }, ct);
            if (e != null) _ctx.EVDetails.Remove(e);
        }

        public async Task<IEnumerable<EVDetail>> GetAllAsync(CancellationToken ct = default)
        {
            // filter out items that are soft-deleted (Item.IsDeleted)
            var query =
                from e in _ctx.EVDetails
                join i in _ctx.Items on e.ItemId equals i.ItemId
                where !(i.IsDeleted == true)
                select e;

            return await query.ToListAsync(ct);
        }

        public async Task<EVDetail?> GetByIdAsync(int itemId, CancellationToken ct = default)
        {
            var query =
                from e in _ctx.EVDetails
                join i in _ctx.Items on e.ItemId equals i.ItemId
                where e.ItemId == itemId && !(i.IsDeleted == true)
                select e;

            return await query.FirstOrDefaultAsync(ct);
        }

        public async Task<bool> ExistsAsync(int itemId, CancellationToken ct = default)
            => await _ctx.EVDetails.AnyAsync(e => e.ItemId == itemId, ct);

        public void Update(EVDetail evDetail)
        {
            _ctx.EVDetails.Update(evDetail);
        }

        public async Task<IEnumerable<Item>> GetLatestEVsAsync(int count)
        {
            return await _ctx.Items
                .Where(x => x.ItemType == ItemType.Ev.ToString() && !(x.IsDeleted == true) && x.Status == "Active")
                .OrderByDescending(x => x.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<EVDetail>> SearchEvDetailAsync(EVSearchRequestDto request)
        {
            var query = _ctx.EVDetails.AsQueryable();

            if (!string.IsNullOrEmpty(request.Brand))
                query = query.Where(e => e.Brand.Contains(request.Brand));

            if (!string.IsNullOrEmpty(request.Model))
                query = query.Where(e => e.Model.Contains(request.Model));

            if (request.Year.HasValue)
                query = query.Where(e => e.Year == request.Year);

            if (!string.IsNullOrEmpty(request.Color))
                query = query.Where(e => e.Color.Contains(request.Color));

            if (request.IsRegistrationValid.HasValue)
                query = query.Where(e => e.IsRegistrationValid == request.IsRegistrationValid);

            return await query.ToListAsync();
        }
    }
}