using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IFavoriteRepository
    {
        Task<Favorite> AddAsync(Favorite favorite);
        Task<List<FavoriteItemDto>> GetFavoritesByUserIdAsync(int userId);
        Task<bool> ExistsAsync(int userId, int itemId);
        Task<Favorite?> GetByIdAsync(int favId);
        Task DeleteAsync(Favorite favorite);
    }
}
