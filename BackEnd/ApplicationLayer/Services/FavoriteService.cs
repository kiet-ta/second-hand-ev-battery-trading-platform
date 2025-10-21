using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public FavoriteService(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<Favorite> CreateFavoriteAsync(CreateFavoriteDto dto)
        {
            // Check for duplicate favorite
            bool exists = await _favoriteRepository.ExistsAsync(dto.UserId, dto.ItemId);
            if (exists)
            {
                throw new InvalidOperationException("This item is already in the user's favorites.");
            }

            var favorite = new Favorite
            {
                UserId = dto.UserId,
                ItemId = dto.ItemId,
                CreatedAt = dto.CreatedAt
            };

            return await _favoriteRepository.AddAsync(favorite);
        }

        public async Task<List<FavoriteItemDto>> GetFavoritesByUserAsync(int userId)
        {
            return await _favoriteRepository.GetFavoritesByUserIdAsync(userId);
        }

        public async Task<bool> ExistsAsync(int userId, int itemId)
        {
            return await _favoriteRepository.ExistsAsync(userId, itemId);
        }
        public async Task<bool> DeleteFavoriteAsync(int favId, int userId)
        {
            var favorite = await _favoriteRepository.GetByIdAsync(favId);
            if (favorite == null || favorite.UserId != userId)
                return false;

            await _favoriteRepository.DeleteAsync(favorite);
            return true;
        }
    }
}
