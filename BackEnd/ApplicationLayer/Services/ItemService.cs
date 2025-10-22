using Application.DTOs.ItemDtos;
using Application.DTOs.UserDtos;
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
        private readonly IItemRepository _itemRepository;

        public ItemService(IItemRepository itemRepository)
        {
            _itemRepository = itemRepository;
        }

        public async Task<ItemDto?> GetByIdAsync(int id)
        {
            var item = await _itemRepository.GetByIdAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found.");
            var images = await _itemRepository.GetByItemIdAsync(id);

            return new ItemDto
            {
                ItemId = item.ItemId,
                ItemType = item.ItemType,
                CategoryId = item.CategoryId,
                Title = item.Title,
                Description = item.Description,
                Price = item.Price,
                Quantity = item.Quantity,
                //Status = item.Status,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt,
                UpdatedBy = item.UpdatedBy,
                Moderation = item.Moderation,
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
            var items = await _itemRepository.GetAllAsync();
            if (items == null)
                throw new Exception("No items found.");
            var result = new List<ItemDto>();


            foreach (var item in items)
            {
                var images = await _itemRepository.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Quantity = item.Quantity,
                    Moderation = item.Moderation,

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
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
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

            await _itemRepository.AddAsync(entity);
            await _itemRepository.SaveChangesAsync();

            // Save images
            if (dto.Images?.Any() == true)
            {
                foreach (var imgDto in dto.Images)
                {
                    await _itemRepository.AddImageAsync(new ItemImage
                    {
                        ItemId = entity.ItemId,
                        ImageUrl = imgDto.ImageUrl
                    });
                }

                await _itemRepository.SaveChangesAsync();
            }

            dto.ItemId = entity.ItemId;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, ItemDto dto)
        {
            var item = await _itemRepository.GetByIdAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found."); if (item == null) return false;

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Price = dto.Price;
            item.Quantity = dto.Quantity;
            item.Status = "pending";
            item.CategoryId = dto.CategoryId;
            item.IsDeleted = false;
            item.UpdatedAt = dto.UpdatedAt;
            item.Moderation = dto.Moderation;

            _itemRepository.Update(item);
            await _itemRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _itemRepository.GetByIdAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found.");

            _itemRepository.Delete(item);
            await _itemRepository.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<ItemDto>> GetLatestEVsAsync(int count)
        {
            var items = await _itemRepository.GetLatestEVsAsync(count);
            if (items == null)
                throw new Exception("No EV items found.");

            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _itemRepository.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Moderation = item.Moderation,
                    Quantity = item.Quantity,
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
            var items = await _itemRepository.GetLatestBatteriesAsync(count);
            if (items == null)
                throw new Exception("No battery items found.");
            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _itemRepository.GetByItemIdAsync(item.ItemId);

                result.Add(new ItemDto
                {
                    ItemId = item.ItemId,
                    ItemType = item.ItemType,
                    CategoryId = item.CategoryId,
                    Title = item.Title,
                    Description = item.Description,
                    Price = item.Price,
                    Moderation = item.Moderation,

                    Quantity = item.Quantity,
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

        public async Task<PagedResultItem<ItemDto>> SearchItemsAsync(
        string itemType,
        string title,
        decimal? minPrice,
        decimal? maxPrice,
        int page,
        int pageSize,
        string sortBy,
        string sortDir)
        {
            // Validate itemType
            if (!string.IsNullOrWhiteSpace(itemType) &&
                !itemType.ToLower().Equals("all") &&
                !itemType.ToLower().Equals("ev") &&
                !itemType.ToLower().Equals("battery"))
            {
                throw new ArgumentException("Invalid item type. Must be 'all', 'ev', or 'battery'.");
            }

            return await _itemRepository.SearchItemsAsync(
                itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir);
        }

        public async Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id)
        {
            var item = await _itemRepository.GetItemWithDetailsAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found.");
            return item;
        }


        public async Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync()
        {
            var items = await _itemRepository.GetAllItemsWithDetailsAsync();
            if (items == null)
                throw new Exception("No detailed items found.");
            return items;
        }

        public async Task<PagedResultBought<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId, PaginationParams paginationParams)
        {
            var items = await _itemRepository.GetBoughtItemsWithDetailsAsync(userId, paginationParams);

            // if (items == null || items.TotalCount == 0)
            // {
            //     throw new KeyNotFoundException($"No bought items found for user ID {userId}.");
            // }

            return items;
        }

        public async Task<IEnumerable<ItemSellerDto>> GetSellerItemsAsync(int sellerId)
        {
            var items = await _itemRepository.GetItemsBySellerIdAsync(sellerId);
            if (items == null)
                throw new KeyNotFoundException($"No items found for seller ID {sellerId}.");
            return items;
        }

        public async Task<UserItemDetailDto?> GetItemDetailByIdAsync(int itemId)
        {
            var result = await _itemRepository.GetItemWithSellerByItemIdAsync(itemId);
            if (result == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            return result;
        }


        public async Task<bool> SetApprovedItemTagAsync(int itemId)
        {
            var item = await _itemRepository.GetByIdAsync(itemId);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            if (item.Moderation != "pending")
                throw new InvalidOperationException("Only pending items can be approved.");

            return await _itemRepository.SetItemTagAsync(itemId, "approved_tag");
        }

        public async Task<bool> SetRejectedItemTagAsync(int itemId)
        {
            var item = await _itemRepository.GetByIdAsync(itemId);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            if (item.Moderation != "pending")
                throw new InvalidOperationException("Only pending items can be rejected.");

            return await _itemRepository.SetItemTagAsync(itemId, "reject_tag");
        }

    }
}
