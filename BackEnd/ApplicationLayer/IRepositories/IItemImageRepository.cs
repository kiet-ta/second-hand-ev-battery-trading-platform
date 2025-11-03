using Domain.Entities;

namespace Application.IRepositories;

public interface IItemImageRepository
{
    public Task<ItemImage?> GetItemImageById(int id);
    Task AddAsync(ItemImage image);
    Task<IEnumerable<ItemImage>> GetByItemIdAsync(int itemId);
    Task SaveChangesAsync();
}