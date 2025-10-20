using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IFavoriteService
    {
        Task<Favorite> CreateFavoriteAsync(CreateFavoriteDto dto);
        Task<List<FavoriteItemDto>> GetFavoritesByUserAsync(int userId);
    }
}
