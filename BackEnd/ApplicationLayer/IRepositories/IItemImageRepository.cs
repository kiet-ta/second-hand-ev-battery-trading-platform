using Domain.Entities;

namespace Application.IRepositories;

public interface IItemImageRepository
{
    public Task<ItemImage?> GetItemImageById(int id);
}