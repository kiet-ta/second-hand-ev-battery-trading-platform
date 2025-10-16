using Domain.Entities;

namespace Application.IRepositories;

public interface IBlogRepository
{
    Task<Blog> CreateAsync(Blog blog);

    Task<IEnumerable<Blog>> GetAllAsync();

    Task<Blog?> GetByIdAsync(int id);
}