using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto.Operators;

namespace Infrastructure.Repositories;

public class BlogRepository : IBlogRepository
{
    private readonly EvBatteryTradingContext _context;

    public BlogRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<Blog> CreateAsync(Blog blog)
    {
        blog.PublishDate = DateTime.Now;

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();
        return blog;
    }

    public async Task<IEnumerable<Blog>> GetAllAsync() => await _context.Blogs
            .OrderByDescending(b => b.PublishDate)
            .ToListAsync();

    public async Task<Blog?> GetByIdAsync(int id) => await _context.Blogs.FindAsync(id);
}