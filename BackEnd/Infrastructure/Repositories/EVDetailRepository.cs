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
    public class EVDetailRepository : IEVDetailRepository
    {
        private readonly EvBatteryTradingContext _ctx;
        public EVDetailRepository(EvBatteryTradingContext ctx) => _ctx = ctx;

        public async Task AddAsync(EVDetail evDetail, CancellationToken ct = default)
        {
            await _ctx.EvDetails.AddAsync(evDetail, ct);
        }

        public async Task DeleteAsync(int itemId, CancellationToken ct = default)
        {
            var e = await _ctx.EvDetails.FindAsync(new object[] { itemId }, ct);
            if (e != null) _ctx.EvDetails.Remove(e);
        }

        public async Task<IEnumerable<EVDetail>> GetAllAsync(CancellationToken ct = default)
        {
            // filter out items that are soft-deleted (Item.IsDeleted)
            var query =
                from e in _ctx.EvDetails
                join i in _ctx.Items on e.ItemId equals i.ItemId
                where !(i.IsDeleted == true)
                select e;

            return await query.ToListAsync(ct);
        }

        public async Task<EVDetail?> GetByIdAsync(int itemId, CancellationToken ct = default)
        {
            var query =
                from e in _ctx.EvDetails
                join i in _ctx.Items on e.ItemId equals i.ItemId
                where e.ItemId == itemId && !(i.IsDeleted == true)
                select e;

            return await query.FirstOrDefaultAsync(ct);
        }

        public async Task<bool> ExistsAsync(int itemId, CancellationToken ct = default)
            => await _ctx.EvDetails.AnyAsync(e => e.ItemId == itemId, ct);

        public void Update(EVDetail evDetail)
        {
            _ctx.EvDetails.Update(evDetail);
        }
    }
}
