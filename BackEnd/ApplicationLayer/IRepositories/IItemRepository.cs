using Application.DTOs.ItemDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IItemRepository
    {
        Task<Item> AddAsync(Item item, CancellationToken ct = default);
        Task<Item?> GetByIdAsync(int itemId, CancellationToken ct = default);
        void Update(Item item);
        Task<bool> ExistsAsync(int itemId, CancellationToken ct = default);
        Task<IEnumerable<Item>> GetItemsByFilterAsync(CancellationToken ct = default);
        Task<IEnumerable<Item>> GetAllAsync();
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

        Task<IEnumerable<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId);

        //Feature: Seller Dashboard
        Task<int> CountAllBySellerAsync(int sellerId);
        Task<int> CountByStatusAsync(int sellerId, string status);
        Task<decimal> GetTotalRevenueAsync(int sellerId);
    }
}
