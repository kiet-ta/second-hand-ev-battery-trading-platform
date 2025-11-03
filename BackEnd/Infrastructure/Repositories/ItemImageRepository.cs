using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ItemImageRepository : IItemImageRepository
{
    private readonly EvBatteryTradingContext _context;

    public ItemImageRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<ItemImage?> GetItemImageById(int id) => await _context.ItemImages.FindAsync(id);
    public async Task AddAsync(ItemImage image) =>  await _context.ItemImages.AddAsync(image);


    public async Task<IEnumerable<ItemImage>> GetByItemIdAsync(int itemId)
    {
        var images = await _context.ItemImages
            .Where(x => x.ItemId == itemId)
            .ToListAsync();
        return images;
    }

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    
}