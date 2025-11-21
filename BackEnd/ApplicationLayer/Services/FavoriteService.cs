using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public FavoriteService(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository ?? throw new ArgumentNullException(nameof(favoriteRepository));
        }

        public async Task<Favorite> CreateFavoriteAsync(CreateFavoriteDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

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

            var created = await _favoriteRepository.AddAsync(favorite)
                ?? throw new InvalidOperationException("Failed to create favorite.");

            return created;
        }

        public async Task<List<FavoriteItemDto>> GetFavoritesByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("User ID must be positive.", nameof(userId));

            var favorites = await _favoriteRepository.GetFavoritesByUserIdAsync(userId)
                ?? throw new InvalidOperationException("Failed to retrieve favorites.");

            return favorites;
        }

        public async Task<bool> ExistsAsync(int userId, int itemId)
        {
            if (userId <= 0)
                throw new ArgumentException("User ID must be positive.", nameof(userId));
            if (itemId <= 0)
                throw new ArgumentException("Item ID must be positive.", nameof(itemId));

            return await _favoriteRepository.ExistsAsync(userId, itemId);
        }

        public async Task<bool> DeleteFavoriteAsync(int favId, int userId)
        {
            if (favId <= 0)
                throw new ArgumentException("Favorite ID must be positive.", nameof(favId));
            if (userId <= 0)
                throw new ArgumentException("User ID must be positive.", nameof(userId));

            var favorite = await _favoriteRepository.GetByIdAsync(favId)
                ?? throw new InvalidOperationException("Favorite not found.");

            if (favorite.UserId != userId)
                throw new InvalidOperationException("User is not authorized to delete this favorite.");

            await _favoriteRepository.DeleteAsync(favorite);
            return true;
        }
    }
}
