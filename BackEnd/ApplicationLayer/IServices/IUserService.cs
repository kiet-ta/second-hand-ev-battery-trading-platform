using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.DTO;
using Domain.Entities;

namespace Services
{
    public interface IUserService
    {
        // Update thông tin user thường
        Task<bool> UpdateUserAsync(int id, UpdateUserDTO dto);

        // Get users có cache, paging
        Task<List<ExternalUser>> GetUsersWithCacheAsync(UserFilterParams filter, int limit, int offset);

        // Delete user và clear cache
        Task<bool> DeleteUserAsync(int id);

        // Admin update user (role/status)
        Task<bool> AdminUpdateUser(int id, AdminUpdateStatusDTO userData);

        // Get users bình thường, paging
        Task<List<ExternalUser>> GetUsersAsync(UserFilterParams filter, int limit , int offset );
    }
}
