using Domain.Entities;

namespace Application.IRepositories;

public interface ICategoryRepository
{
    Task<Category> GetCategoryByIdAsync(int id);
}