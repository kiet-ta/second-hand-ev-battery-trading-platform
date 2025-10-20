using Application.DTOs.ItemDtos;
using Application.DTOs.UserDtos;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IItemService
    {
        Task<ItemDto?> GetByIdAsync(int id);

        Task<IEnumerable<ItemDto>> GetAllAsync();

        Task<ItemDto> CreateAsync(ItemDto dto);

        Task<bool> UpdateAsync(int id, ItemDto dto);

        Task<bool> DeleteAsync(int id);

        Task<IEnumerable<ItemDto>> GetLatestEVsAsync(int count);

        Task<IEnumerable<ItemDto>> GetLatestBatteriesAsync(int count);

        Task<PagedResultItem<ItemDto>> SearchItemsAsync(
        string itemType,
        string title,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int page = 1,
        int pageSize = 20,
        string sortBy = "UpdatedAt",
        string sortDir = "desc");

        Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id);
        Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync();
        Task<IEnumerable<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId);
        Task<IEnumerable<ItemSellerDto>> GetSellerItemsAsync(int sellerId);
        Task<UserItemDetailDto?> GetItemDetailByIdAsync(int itemId);
        Task<bool> SetApprovedItemTagAsync(int itemId);
        Task<bool> SetRejectedItemTagAsync(int itemId);
    }
}
