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
    }
}
