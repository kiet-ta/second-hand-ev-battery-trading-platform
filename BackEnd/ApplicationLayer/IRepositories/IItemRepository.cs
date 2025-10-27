using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.DTOs.UserDtos;
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
        Task<Item> AddAsync(Item item, CancellationToken? ct = null);
        Task<Item?> GetByIdAsync(int itemId, CancellationToken? ct = null);
        void Update(Item item);
        Task<bool> ExistsAsync(int itemId, CancellationToken? ct = null);
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

        Task<PagedResultBought<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId, PaginationParams paginationParams);
        Task<PagedResultBought<ItemBoughtDto>> GetTransactionItemsWithDetailsAsync(int userId, PaginationParams paginationParams);

        //Feature: Seller Dashboard
        Task<int> CountAllBySellerAsync(int sellerId);
        Task<int> CountByStatusAsync(int sellerId, string status);
        Task<int> GetTotalItemsSoldBySellerAsync(int sellerId);
        Task<decimal> GetTotalRevenueAsync(int sellerId);
        Task AddImageAsync(ItemImage image);
        Task<IEnumerable<ItemImage>> GetByItemIdAsync(int itemId);
        Task<IEnumerable<Item>> GetBySellerIdAsync(int sellerId);
        Task<int> GetTotalProductsAsync(int sellerId);

        Task<IEnumerable<ItemSellerDto>> GetItemsBySellerIdAsync(int sellerId);
        Task<int> CountActiveAsync();
        Task<IEnumerable<(string ItemType, int Count)>> GetItemTypeCountsAsync();
        Task<UserItemDetailDto?> GetItemWithSellerByItemIdAsync(int itemId);
        Task<bool> SetItemTagAsync(int itemId, string tag);

        Task<PagedResultItem<ItemDto>> SearchItemsAsync(string itemType, string title, decimal? minPrice, decimal? maxPrice, int page, int pageSize, string sortBy, string sortDir);
        Task<IEnumerable<EVDetail>> SearchEvDetailAsync(EVSearchRequestDto request);
        Task<IEnumerable<BatteryDetail>> SearchBatteryDetailAsync(BatterySearchRequestDto request);
    }
}
