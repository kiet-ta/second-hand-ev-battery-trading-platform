using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IServices;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Domain.Common.Constants;
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
        private readonly IUnitOfWork _unitOfWork;

        public ItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ItemDto?> GetByIdAsync(int id)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found.");
            var images = await _unitOfWork.Items.GetByItemIdAsync(id);

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
            var items = await _unitOfWork.Items.GetAllAsync();
            if (items == null)
                throw new Exception("No items found.");
            var result = new List<ItemDto>();


            foreach (var item in items.Where(i => i.Status == "Active"))
            {
                var images = await _unitOfWork.Items.GetByItemIdAsync(item.ItemId);

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

                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    IsDeleted = item.IsDeleted,
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
                Status = ItemStatus.Pending.ToString(),
                UpdatedBy = dto.UpdatedBy,
                IsDeleted = false,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            await _unitOfWork.Items.AddAsync(entity);
            await _unitOfWork.Items.SaveChangesAsync();

            // Save images
            if (dto.Images?.Any() == true)
            {
                foreach (var imgDto in dto.Images)
                {
                    await _unitOfWork.Items.AddImageAsync(new ItemImage
                    {
                        ItemId = entity.ItemId,
                        ImageUrl = imgDto.ImageUrl
                    });
                }

                await _unitOfWork.Items.SaveChangesAsync();
            }

            dto.ItemId = entity.ItemId;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, ItemDto dto)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found."); if (item == null) return false;

            item.Title = dto.Title;
            item.Description = dto.Description;
            item.Price = dto.Price;
            item.Quantity = dto.Quantity;
            item.Status = dto.Status;
            item.CategoryId = dto.CategoryId;
            item.IsDeleted = false;
            item.UpdatedAt = dto.UpdatedAt;
            item.Moderation = dto.Moderation;

            _unitOfWork.Items.Update(item);
            await _unitOfWork.Items.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found.");

            _unitOfWork.Items.Delete(item);
            await _unitOfWork.Items.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<ItemDto>> GetLatestEVsAsync(int count)
        {
            var items = await _unitOfWork.Items.GetLatestEVsAsync(count);
            if (items == null)
                throw new Exception("No EV items found.");

            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _unitOfWork.Items.GetByItemIdAsync(item.ItemId);

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
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    IsDeleted = item.IsDeleted,
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
            var items = await _unitOfWork.Items.GetLatestBatteriesAsync(count);
            if (items == null)
                throw new Exception("No battery items found.");
            var result = new List<ItemDto>();

            foreach (var item in items)
            {
                var images = await _unitOfWork.Items.GetByItemIdAsync(item.ItemId);

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
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    //IsVerified = item.IsVerified,
                    IsDeleted = item.IsDeleted,
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

            return await _unitOfWork.Items.SearchItemsAsync(
                itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir);
        }

        public async Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int id)
        {
            var item = await _unitOfWork.Items.GetItemWithDetailsAsync(id);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {id} not found.");
            return item;
        }

        public async Task<ItemWithDetailDto?> GetItemWithDetailsAsync(int itemId, int buyerId, int orderId)
        {
            var item = await _unitOfWork.Items.GetItemWithDetailsAsync(itemId, buyerId, orderId);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            return item;
        }


        public async Task<IEnumerable<ItemWithDetailDto>> GetAllItemsWithDetailsAsync()
        {
            var items = await _unitOfWork.Items.GetAllItemsWithDetailsAsync();
            if (items == null)
                throw new Exception("No detailed items found.");
            return items;
        }

        public async Task<PagedResultBought<ItemBoughtDto>> GetBoughtItemsWithDetailsAsync(int userId, PaginationParams paginationParams)
        {
            var items = await _unitOfWork.Items.GetBoughtItemsWithDetailsAsync(userId, paginationParams);

            // if (items == null || items.TotalCount == 0)
            // {
            //     throw new KeyNotFoundException($"No bought items found for user ID {userId}.");
            // }

            return items;
        }

        public async Task<PagedResultBought<ItemBoughtDto>> GetTransactionItemsWithDetailsAsync(int userId, PaginationParams paginationParams)
        {
            var items = await _unitOfWork.Items.GetTransactionItemsWithDetailsAsync(userId, paginationParams);

            if (items == null || items.TotalCount == 0)
            {
                throw new KeyNotFoundException($"No Transaction items found for user ID {userId}.");
            }

            return items;
        }

        public async Task<IEnumerable<ItemSellerDto>> GetSellerItemsAsync(int sellerId)
        {
            var items = await _unitOfWork.Items.GetItemsBySellerIdAsync(sellerId);
            if (items == null)
                throw new KeyNotFoundException($"No items found for seller ID {sellerId}.");
            return items;
        }

        public async Task<UserItemDetailDto?> GetItemDetailByIdAsync(int itemId)
        {
            var result = await _unitOfWork.Items.GetItemWithSellerByItemIdAsync(itemId);
            if (result == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            return result;
        }


        public async Task<bool> SetApprovedItemTagAsync(int itemId)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(itemId);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            if (item.Moderation != "Pending")
                throw new InvalidOperationException("Only pending items can be approved.");

            return await _unitOfWork.Items.SetItemTagAsync(itemId, "Approved");
        }

        public async Task<bool> SetRejectedItemTagAsync(int itemId)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(itemId);
            if (item == null)
                throw new KeyNotFoundException($"Item with ID {itemId} not found.");
            if (item.Moderation != "pending")
                throw new InvalidOperationException("Only pending items can be rejected.");

            return await _unitOfWork.Items.SetItemTagAsync(itemId, "reject_tag");
        }

        public async Task<IEnumerable<EVDetailDto>> SearchEvDetailAsync(EVSearchRequestDto request)
        {
            var result = await _unitOfWork.Items.SearchEvDetailAsync(request);
            return result.Select(e => new EVDetailDto
            {
                ItemId = e.ItemId,
                Brand = e.Brand,
                Model = e.Model,
                Year = e.Year,
                Color = e.Color,
                LicensePlate = e.LicensePlate,
                Mileage = e.Mileage,
                LicenseUrl = e.LicenseUrl
            });
        }

        public async Task<IEnumerable<BatteryDetailDto>> SearchBatteryDetailAsync(BatterySearchRequestDto request)
        {
            var result = await _unitOfWork.Items.SearchBatteryDetailAsync(request);
            return result.Select(e => new BatteryDetailDto
            {
                ItemId = e.ItemId,
                Brand = e.Brand,
                Capacity = e.Capacity,
                Condition = e.Condition,
                Voltage = e.Voltage,
                ChargeCycles = e.ChargeCycles
            });
        }

        public async Task<List<ItemWithDetailDto>> GetItemsForModerationAsync()
        {
            var items = await _unitOfWork.Items.GetModerationItem();
            return items;
        }
    }
}