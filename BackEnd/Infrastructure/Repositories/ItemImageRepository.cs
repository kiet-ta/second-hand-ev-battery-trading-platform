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
}