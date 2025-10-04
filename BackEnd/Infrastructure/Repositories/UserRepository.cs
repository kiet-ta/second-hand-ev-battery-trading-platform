using Application.DTOs.UserDtos;
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
    public class UserRepository : IUserRepository
    {
        private readonly EvBatteryTradingContext _context;

        public UserRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsDeleted == false);
        }

        public async Task AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        //public async Task<User?> GetNewVehicles

        public async Task<List<(string Role, int Count)>> GetUsersByRoleAsync()
        {
            var result = await _context.Users
                .AsNoTracking()
                .GroupBy(u => u.Role)
                .Select(g => new ValueTuple<string, int>(g.Key, g.Count()))
                .ToListAsync();

            return result;
        }
    }
}
