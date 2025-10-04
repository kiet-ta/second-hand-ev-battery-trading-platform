using Application.DTOs.ItemDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IItemRepository //: IRepository<Item>
    {
        Task<Item?> GetByIdAsync(int id);

        Task<IEnumerable<Item>> GetAllAsync();

        Task AddAsync(Item item);

        void Update(Item item);

        void Delete(Item item);

        Task SaveChangesAsync();

        Task<IEnumerable<Item>> GetLatestEVsAsync(int count);

        Task<IEnumerable<Item>> GetLatestBatteriesAsync(int count);

        Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id);

        Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync();

        /// <summary>
        /// Returns an IQueryable so service can compose filters and projection.
        /// This keeps repository lightweight and testable.
        /// </summary>
        /// <returns></returns>
        IQueryable<ItemDto> QueryItemsWithSeller();
    }
}
