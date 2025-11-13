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
        private readonly IUnitOfWork _unitOfWork;

        public FavoriteService(IFavoriteRepository favoriteRepository, IUnitOfWork unitOfWork)
        {

            _unitOfWork = unitOfWork;
        }

        public async Task<Favorite> CreateFavoriteAsync(CreateFavoriteDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            // Check for duplicate favorite
            bool exists = await _unitOfWork.Favorites.ExistsAsync(dto.UserId, dto.ItemId);
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

            var created = await _unitOfWork.Favorites.AddAsync(favorite)
                ?? throw new InvalidOperationException("Failed to create favorite.");

            return created;
        }

        public async Task<List<FavoriteItemDto>> GetFavoritesByUserAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("User ID must be positive.", nameof(userId));

            var favorites = await _unitOfWork.Favorites.GetFavoritesByUserIdAsync(userId)
                ?? throw new InvalidOperationException("Failed to retrieve favorites.");

            return favorites;
        }

        public async Task<bool> ExistsAsync(int userId, int itemId)
        {
            if (userId <= 0)
                throw new ArgumentException("User ID must be positive.", nameof(userId));
            if (itemId <= 0)
                throw new ArgumentException("Item ID must be positive.", nameof(itemId));

            return await _unitOfWork.Favorites.ExistsAsync(userId, itemId);
        }

        public async Task<bool> DeleteFavoriteAsync(int favId, int userId)
        {
            if (favId <= 0)
                throw new ArgumentException("Favorite ID must be positive.", nameof(favId));
            if (userId <= 0)
                throw new ArgumentException("User ID must be positive.", nameof(userId));

            var favorite = await _unitOfWork.Favorites.GetByIdAsync(favId)
                ?? throw new InvalidOperationException("Favorite not found.");

            if (favorite.UserId != userId)
                throw new InvalidOperationException("User is not authorized to delete this favorite.");

            await _unitOfWork.Favorites.DeleteAsync(favorite);
            return true;
        }
    }
}
