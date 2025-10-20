using Domain.Entities;

namespace Application.IRepositories
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();

        Task<User?> GetByIdAsync(int id);

        Task<User?> GetByEmailAsync(string email);

        Task AddAsync(User user);

        Task UpdateAsync(User user);

        Task DeleteAsync(int id);

        Task<List<(string Role, int Count)>> GetUsersByRoleAsync();

        Task UpdateAvatarAsync(int userId, string avatarUrl);

        Task<int> CountAsync();
        Task<double> GetMonthlyGrowthAsync();
        Task<(IEnumerable<User> Users, int TotalCount)> GetAllPagedAsync(int page, int pageSize);

        Task SaveChangesAsync();
    }
}