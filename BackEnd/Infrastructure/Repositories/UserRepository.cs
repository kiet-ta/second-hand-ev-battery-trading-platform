using Application.IRepositories;
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
        if (_context == null)
            throw new Exception("_context is NULL");
        return await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id && !(u.IsDeleted == true));
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        if (string.IsNullOrWhiteSpace(username)) return false;
        return await _context.Users.AnyAsync(u => u.FullName == username && !u.IsDeleted);
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

    public async Task UpdateAvatarAsync(int userId, string avatarUrl)
    {
        var user = await GetByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        user.AvatarProfile = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
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

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _context.Users.CountAsync(u => u.IsDeleted == false);
    }

    public async Task<double> GetMonthlyGrowthAsync()
    {
        var now = DateTime.UtcNow;
        var prevMonth = now.AddMonths(-1);

        var currentMonthUsers = await _context.Users.CountAsync(u =>
            u.CreatedAt.Month == now.Month &&
            u.CreatedAt.Year == now.Year);

        var previousMonthUsers = await _context.Users.CountAsync(u =>
            u.CreatedAt.Month == prevMonth.Month &&
            u.CreatedAt.Year == prevMonth.Year);

        if (previousMonthUsers == 0)
            return currentMonthUsers > 0 ? 100 : 0;

        return ((double)(currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;
    }

    public async Task<(IEnumerable<User> Users, int TotalCount)> GetAllPagedAsync(int page, int pageSize)
    {
        var query = _context.Users
            .Where(u => !u.IsDeleted);

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.UserId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }
}