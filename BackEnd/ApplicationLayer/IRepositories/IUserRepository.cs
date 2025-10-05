using Application.DTOs.UserDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();

        Task<User?> GetByIdAsync(int id);

        Task<User?> GetByEmailAsync(string email);

        Task AddUserAsync(User user);

        Task UpdateAsync(User user);

        Task DeleteAsync(int id);
        Task<List<(string Role, int Count)>> GetUsersByRoleAsync();
    }
}