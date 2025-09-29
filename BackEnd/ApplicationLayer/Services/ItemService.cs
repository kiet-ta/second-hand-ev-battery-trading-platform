using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Infrastructure.Data;
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
                Status = item.Status ?? ""
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
                Status = i.Status ?? ""
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
                Status = dto.Status,
                //CreatedAt = DateTime.Now,
                //UpdatedAt = DateTime.Now
            };
            await _repo.AddAsync(item);
            await _repo.SaveChangesAsync();

            dto.ItemId = item.ItemId;
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
            item.Status = dto.Status;
            item.CategoryId = dto.CategoryId;
            //item.UpdatedAt = DateTime.Now;

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
    }
}
