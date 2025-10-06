using Application.IRepositories.IBiddingRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ItemBiddingRepository : IItemBiddingRepository
{
    private readonly EvBatteryTradingContext _context;

    public ItemBiddingRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<ItemBidding> GetByItemIdAsync(int itemId) =>
        await _context.ItemBiddings.FirstOrDefaultAsync(b => b.ItemId == itemId);

    public async Task<ItemBidding> GetByIdAsync(int biddingId) =>
        await _context.ItemBiddings.FindAsync(biddingId);

    public async Task<IEnumerable<ItemBidding>> getActiveAutionsAsync() =>
        await _context.ItemBiddings.Where(b => b.Status == "active").ToListAsync();

    public async Task<int> CreateAsync(ItemBidding itemBidding)
    {
        await _context.ItemBiddings.AddAsync(itemBidding);
        return await _context.SaveChangesAsync();
    }

    public async Task UpdateCurrentPriceAsync(ItemBidding bidding)
    {
        _context.ItemBiddings.Update(bidding);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateStatusAsync(ItemBidding bidding, string newStatus)
    {
        bidding.Status = newStatus;
        _context.ItemBiddings.Update(bidding);
        await _context.SaveChangesAsync();
    }
}