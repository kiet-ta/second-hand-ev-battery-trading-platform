using Domain.Entities;


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
    }
}