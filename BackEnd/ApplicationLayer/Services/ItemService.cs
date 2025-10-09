using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ItemService : IItemService
    {
        private readonly IItemRepository _repo;

        public ItemService(IItemRepository repo)
        {
            _repo = repo;
        }

        public async Task<ItemDto?> GetByIdAsync(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null) return null;

            return new ItemDto
            {
                ItemId = item.ItemId,
                ItemType = item.ItemType ?? "",
                CategoryId = item.CategoryId,
                Title = item.Title,
                Description = item.Description,
                Price = item.Price,
                Quantity = item.Quantity ?? 0,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                UpdatedBy = item.UpdatedBy
                //Status = item.Status ?? "",
                //IsDeleted = false
            };
        }

        public async Task<IEnumerable<ItemDto>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            return items.Select(i => new ItemDto
            {
                ItemId = i.ItemId,
                ItemType = i.ItemType ?? "",
                CategoryId = i.CategoryId,
                Title = i.Title,
                Description = i.Description,
                Price = i.Price,
                Quantity = i.Quantity ?? 0,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                UpdatedBy = i.UpdatedBy
                //Status = i.Status ?? "active",
                //IsDeleted = i.IsDeleted
            });
        }

        public async Task<ItemDto> CreateAsync(ItemDto dto)
        {
            var item = new Item
            {
                ItemType = dto.ItemType,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                Status = "pending",
                IsDeleted = false,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt
            };
            await _repo.AddAsync(item);
            await _repo.SaveChangesAsync();

            //dto.ItemId = item.ItemId;
            return dto; 
        }

        public async Task<bool> UpdateAsync(int id, ItemDto dto)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null) return false;

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Price = dto.Price;
            item.Quantity = dto.Quantity;
            item.Status = "pending";
            item.CategoryId = dto.CategoryId;
            item.IsDeleted = false;
            item.UpdatedAt = dto.UpdatedAt;

            _repo.Update(item);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null) return false;

            _repo.Delete(item);
            await _repo.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<ItemDto>> GetLatestEVsAsync(int count)
        {
            var items = await _repo.GetLatestEVsAsync(count);

            return items.Select(i => new ItemDto
            {
                ItemId = i.ItemId,
                ItemType = i.ItemType ?? "",
                CategoryId = i.CategoryId,
                Title = i.Title,
                Description = i.Description,
                Price = i.Price,    
                Quantity = i.Quantity ?? 0,
                CreatedAt = i.CreatedAt
                //Status = i.Status ?? "active",
                //IsDeleted = i.IsDeleted
            });
        }
        public async Task<IEnumerable<ItemDto>> GetLatestBatteriesAsync(int count)
        {
            var items = await _repo.GetLatestBatteriesAsync(count);

            return items.Select(i => new ItemDto
            {
                ItemId = i.ItemId,
                ItemType = i.ItemType ?? "",
                CategoryId = i.CategoryId,
                Title = i.Title,
                Description = i.Description,
                Price = i.Price,
                Quantity = i.Quantity ?? 0,
                CreatedAt = i.CreatedAt
                //Status = i.Status ?? "active",
                //IsDeleted = i.IsDeleted
            });
        }

        public async Task<PagedResult<ItemDto>> SearchItemsAsync(
            string itemType,
            string title,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int page = 1, int pageSize = 20,
            string sortBy = "UpdatedAt", string sortDir = "desc")
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 20;

            var query = _repo.QueryItemsWithSeller(); // IQueryable<Item>

            // Filters
            if (!string.IsNullOrWhiteSpace(itemType))
            {
                var t = itemType.Trim();
                query = query.Where(i => i.ItemType == t);
            }

            //if (!string.IsNullOrWhiteSpace(sellerName))
            //{
            //    var name = sellerName.Trim();

            //    query = query.Where(i =>
            //        EF.Functions.Like(EF.Property<User>(i, "UpdatedBy").FullName ?? "", $"%{name}%")
            //    );
            //}

            if (!string.IsNullOrWhiteSpace(title))
            {
                var t = title.Trim();
                query = query.Where(i => i.Title.Contains(t));
            }

            if (minPrice.HasValue)
                query = query.Where(i => i.Price.HasValue && i.Price.Value >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(i => i.Price.HasValue && i.Price.Value <= maxPrice.Value);

            // Sorting
            bool descending = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
            query = sortBy switch
            {
                "Price" => descending ? query.OrderByDescending(i => i.Price) : query.OrderBy(i => i.Price),
                "Title" => descending ? query.OrderByDescending(i => i.Title) : query.OrderBy(i => i.Title),
                _ => descending ? query.OrderByDescending(i => i.UpdatedAt) : query.OrderBy(i => i.UpdatedAt)
            };

            var total = await query.LongCountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new ItemDto
                {
                    ItemId = i.ItemId,
                    ItemType = i.ItemType,
                    Title = i.Title,
                    //SellerName =  EF.Property<User>(i, "UpdatedByUser").FullName,
                    Price = i.Price,
                    //Status = i.Status,
                    UpdatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return new PagedResult<ItemDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = items
            };
        }

        public async Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id)
        {
            return await _repo.GetItemWithDetailsAsync(id);
        }

        public async Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync()
        {
            return await _repo.GetAllItemsWithDetailsAsync();
        }

        public async Task<IEnumerable<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId)
        {
            return await _repo.GetBoughtItemsWithDetailsAsync(userId);
        }
    }
}
