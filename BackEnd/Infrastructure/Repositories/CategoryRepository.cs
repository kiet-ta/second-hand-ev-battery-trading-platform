using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly EvBatteryTradingContext _context;

    public CategoryRepository(EvBatteryTradingContext context)
    {
        _context = context;
    }

    public async Task<Category?> GetCategoryByIdAsync(int id)
        => await _context.Categories.FindAsync(id);
}