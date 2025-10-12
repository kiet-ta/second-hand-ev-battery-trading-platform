using Application.IRepositories;
using AutoMapper;
using Domain.DTOs;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public class UserRepository : IUserRepository
{
    private readonly EvBatteryTradingContext _context;

    public UserRepository(EvBatteryTradingContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .Where(u => !(u.IsDeleted == true))
            .ToListAsync();
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id && !(u.IsDeleted == true));
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && !(u.IsDeleted == true));
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }
    public async Task<List<(string Role, int Count)>> GetUsersByRoleAsync()
    {
        var result = await _context.Users
            .AsNoTracking()
            .GroupBy(u => u.Role)
            .Select(g => new ValueTuple<string, int>(g.Key, g.Count()))
            .ToListAsync();

        return result;
    }

    public async Task UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.Now;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            user.IsDeleted = true; // soft delete
            user.UpdatedAt = DateTime.Now;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}