using Application.DTOs.ItemDtos;
using Application.IRepositories;
using Application.IServices;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

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

            var images = await _repo.GetByItemIdAsync(id);

            return new ItemDto
            {
                ItemId = item.ItemId,
                ItemType = item.ItemType,
                CategoryId = item.CategoryId,
                Title = item.Title,
                Description = item.Description,
                Price = item.Price,
                Quantity = item.Quantity ?? 0,
                //Status = item.Status,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                UpdatedBy = item.UpdatedBy,
                //IsVerified = item.IsVerified,
                //IsDeleted = item.IsDeleted,
                Images = images.Select(img => new ItemImageDto
                {
                    ImageId = img.ImageId,
                    ImageUrl = img.ImageUrl
                }).ToList()
            };
        }

        public async Task<IEnumerable<ItemDto>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _repo.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Quantity = item.Quantity ?? 0,
                    //Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    //IsDeleted = item.IsDeleted,
                    Images = images.Select(img => new ItemImageDto
                    {
                        ImageId = img.ImageId,
                        ImageUrl = img.ImageUrl
                    }).ToList()
                });
            }

            return result;
        }

        public async Task<ItemDto> CreateAsync(ItemDto dto)
        {
            var entity = new Item
            {
                ItemType = dto.ItemType,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                Status = "pending",
                IsDeleted = false,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();

            // Save images
            if (dto.Images?.Any() == true)
            {
                foreach (var imgDto in dto.Images)
                {
                    await _repo.AddImageAsync(new ItemImage
                    {
                        ItemId = entity.ItemId,
                        ImageUrl = imgDto.ImageUrl
                    });
                }

                await _repo.SaveChangesAsync();
            }

            dto.ItemId = entity.ItemId;
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

            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _repo.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Quantity = item.Quantity ?? 0,
                    //Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    //IsDeleted = item.IsDeleted,
                    Images = images.Select(img => new ItemImageDto
                    {
                        ImageId = img.ImageId,
                        ImageUrl = img.ImageUrl
                    }).ToList()
                });
            }

            return result;
        }
        public async Task<IEnumerable<ItemDto>> GetLatestBatteriesAsync(int count)
        {
            var items = await _repo.GetLatestBatteriesAsync(count);

            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _repo.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Quantity = item.Quantity ?? 0,
                    //Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    //IsDeleted = item.IsDeleted,
                    Images = images.Select(img => new ItemImageDto
                    {
                        ImageId = img.ImageId,
                        ImageUrl = img.ImageUrl
                    }).ToList()
                });
            }

            return result;
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

            var query = _repo.QueryItemsWithSeller();

            if (!string.IsNullOrWhiteSpace(itemType))
                query = query.Where(i => i.ItemType == itemType.Trim());

            if (!string.IsNullOrWhiteSpace(title))
                query = query.Where(i => i.Title.Contains(title.Trim()));

            if (minPrice.HasValue)
                query = query.Where(i => i.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(i => i.Price <= maxPrice.Value);

            bool desc = sortDir.Equals("desc", StringComparison.OrdinalIgnoreCase);
            query = sortBy switch
            {
                "Price" => desc ? query.OrderByDescending(i => i.Price) : query.OrderBy(i => i.Price),
                "Title" => desc ? query.OrderByDescending(i => i.Title) : query.OrderBy(i => i.Title),
                _ => desc ? query.OrderByDescending(i => i.UpdatedAt) : query.OrderBy(i => i.UpdatedAt)
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
                    Price = i.Price,
                    UpdatedAt = i.UpdatedAt,
                    //SellerName = i.UpdatedByUser.FullName,
                    //Images = i.Images.ToList()
                }).ToListAsync();

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
