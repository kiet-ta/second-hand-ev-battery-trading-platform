using Application.IRepositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly EvBatteryTradingContext _dbContext;

        public UserRepository(EvBatteryTradingContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Mapping: Model -> DTO
        private ExternalUser MapToDto(ExternalUser entity)
        {
            return new ExternalUser
            {
                UserId = entity.UserId,
                Name = entity.Name,
                Email = entity.Email,
                Phone = entity.Phone,
                Role = entity.Role,
                Status = entity.Status
            };
        }
        public async Task<ExternalUser?> GetUserByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;

            return await _dbContext.ExternalUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        // Lấy user theo Phone
        public async Task<ExternalUser?> GetUserByPhoneAsync(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return null;

            return await _dbContext.ExternalUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Phone == phone);
        }


        // Get userDTO by ID
        public async Task<ExternalUser?> GetUserDtoByIdAsync(int userId)
        {
            var entity = await _dbContext.ExternalUsers
                .FirstOrDefaultAsync(u => u.UserId == userId);

            return entity == null ? null : MapToDto(entity);
        }

        // 🔹 Get all users
        public async Task<List<ExternalUser>> GetUsersAsync()
        {
            var entities = await _dbContext.ExternalUsers.ToListAsync();
            return entities.Select(MapToDto).ToList();
        }

        // 🔹 Update thông tin user thường

        public async Task<bool> UpdateUserDirectAsync(int id, ExternalUser userData)
        {
            var user = await _dbContext.ExternalUsers.FindAsync(id);
            if (user == null) return false;

            // Chỉ gán nếu có giá trị (không null)
            if (!string.IsNullOrWhiteSpace(userData.Name))
                user.Name = userData.Name;

            if (!string.IsNullOrWhiteSpace(userData.Email))
                user.Email = userData.Email;

            if (!string.IsNullOrWhiteSpace(userData.Phone))
                user.Phone = userData.Phone;

            if (!string.IsNullOrWhiteSpace(userData.PasswordHash))
                user.PasswordHash = userData.PasswordHash;

            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return true;
        }

        // 🔹 Admin update status/role/KYC
        public async Task<bool> AdminUpdateDirectAsync(int id, ExternalUser userData)
        {
            var user = await _dbContext.ExternalUsers.FindAsync(id);
            if (user == null) return false;

            // Ghi trực tiếp dữ liệu mới từ userData
            user.Role = userData.Role;
            user.Status = userData.Status;
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return true;
        }

        // 🔹 Soft delete user (chỉ set status, không xử lý logic khác)
        public async Task<bool> DeleteUserDirectAsync(int userId)
        {
            var user = await _dbContext.ExternalUsers.FindAsync(userId);
            if (user == null) return false;

            user.Status = "blocked";
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            return true;
        }



        public IQueryable<ExternalUser> GetAllUsersQueryable()
        {
            return _dbContext.ExternalUsers.AsQueryable();
        }
    }
}
