using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly EvBatteryTradingContext _context;

        public FavoriteRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<Favorite> AddAsync(Favorite favorite)
        {
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return favorite;
        }

        public async Task<List<FavoriteItemDto>> GetFavoritesByUserIdAsync(int userId)
        {
            var query = from f in _context.Favorites
                        join i in _context.Items on f.ItemId equals i.ItemId
                        where f.UserId == userId && i.IsDeleted == false
                        select new FavoriteItemDto
                        {
                            FavId = f.FavId,
                            ItemId = i.ItemId,
                            ItemType = i.ItemType,
                            Title = i.Title,
                            Description = i.Description,
                            Price = i.Price,
                            Status = i.Status,
                            ImageUrls = _context.ItemImages
                                .Where(img => img.ItemId == i.ItemId)
                                .Select(img => img.ImageUrl)
                                .ToList()
                        };

            var favorites = await query.ToListAsync();

            foreach (var fav in favorites)
            {
                if (fav.ItemType == "ev")
                {
                    var detail = await _context.EVDetails
                        .Where(d => d.ItemId == fav.ItemId)
                        .Select(d => new EVDetailDto
                        {
                            Brand = d.Brand,
                            Model = d.Model,
                            Version = d.Version,
                            Year = d.Year,
                            BodyStyle = d.BodyStyle,
                            Color = d.Color,
                            LicensePlate = d.LicensePlate,
                            HasAccessories = d.HasAccessories,
                            PreviousOwners = d.PreviousOwners,
                            IsRegistrationValid = d.IsRegistrationValid,
                            Mileage = d.Mileage,
                            LicenseUrl = d.LicenseUrl
                        })
                        .FirstOrDefaultAsync();

                    fav.ItemDetail = detail;
                }
                else if (fav.ItemType == "battery")
                {
                    var detail = await _context.BatteryDetails
                        .Where(d => d.ItemId == fav.ItemId)
                        .Select(d => new BatteryDetailDto
                        {
                            Brand = d.Brand,
                            Capacity = d.Capacity,
                            Condition = d.Condition,
                            Voltage = d.Voltage,
                            ChargeCycles = d.ChargeCycles
                        })
                        .FirstOrDefaultAsync();

                    fav.ItemDetail = detail;
                }
            }

            return favorites;
        }
        public async Task<Favorite?> GetByIdAsync(int favId)
        {
            return await _context.Favorites.FirstOrDefaultAsync(f => f.FavId == favId);
        }

        public async Task<bool> ExistsAsync(int userId, int itemId)
        {
            return await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.ItemId == itemId);
        }
        public async Task DeleteAsync(Favorite favorite)
        {
            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
        }
    }
}
