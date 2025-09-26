
using Microsoft.EntityFrameworkCore;
using Application.IRepositories;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using UserEntity = Domain.Entities.ExternalUser;
using UserDto = Domain.DTO.UserDTO;
using Domain.DTO;
using Domain.Entities;
using Application.IHelpers;
using Application.IValidations;

namespace Services
{
    public class UserService(IUserRepository userRepo, IUserHelper userHelper,IUserValidation userValidation, IPasswordHelper passwordHelper ): IUserService
    {
        private readonly IUserHelper _userHelper = userHelper;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IUserValidation _userValidation = userValidation;
        private readonly IPasswordHelper _passwordHelper = passwordHelper;

        /// <summary>
        /// Update user (self update). Validate fields trước khi commit.
        /// </summary>
        public async Task<bool> UpdateUserAsync(int id, UpdateUserDTO dto)
        {
            var existingUser = await  _userRepo.GetUserDtoByIdAsync(id);
            if (existingUser == null) return false;

            var updatedUser = new ExternalUser
            {
                UserId = existingUser.UserId,
                Name = existingUser.Name,
                Email = existingUser.Email,
                Phone = existingUser.Phone,
                Role = existingUser.Role,
                Status = existingUser.Status,
                PasswordHash = existingUser.PasswordHash,
                UpdatedAt = DateTime.UtcNow
            };

            bool isUpdated = false;

            // Name
            if (!string.IsNullOrWhiteSpace(dto.Name) && existingUser.Name != dto.Name)
            {
                if (!_userValidation.IsValidString(dto.Name))
                    throw new ArgumentException("Invalid name");

                updatedUser.Name = dto.Name.Trim();
                isUpdated = true;
            }

            // Email
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                !string.Equals(existingUser.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (!_userValidation.IsValidEmail(dto.Email))
                    throw new ArgumentException("Invalid email format");

                var emailExists = await  _userRepo.GetUserByEmailAsync(dto.Email);
                if (emailExists != null && emailExists.UserId != id)
                    throw new ArgumentException("Email already exists");

                updatedUser.Email = dto.Email.Trim().ToLower();
                isUpdated = true;
            }

            // Phone
            if (!string.IsNullOrWhiteSpace(dto.Phone) && existingUser.Phone != dto.Phone)
            {
                if (!_userValidation.IsValidVNPhone(dto.Phone))
                    throw new ArgumentException("Invalid VN phone number");

                var phoneExists = await  _userRepo.GetUserByPhoneAsync(dto.Phone);
                if (phoneExists != null && phoneExists.UserId != id)
                    throw new ArgumentException("Phone already exists");

                updatedUser.Phone = dto.Phone.Trim();
                isUpdated = true;
            }

            // Password
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                if (!_userValidation.IsStrongPassword(dto.Password))
                    throw new ArgumentException("Weak password");

                updatedUser.PasswordHash = _passwordHelper.HashPassword(dto.Password);
                isUpdated = true;
            }

            // Commit
            if (isUpdated)
            {
                try
                {
                    var ok = await  _userRepo.UpdateUserDirectAsync(id, updatedUser);
                    if (ok) await _userHelper.ClearUsersCacheAsync();
                    return ok;
                }
                catch (DbUpdateException ex)
                {
                    throw new InvalidOperationException("Database update failed.", ex);
                }
            }

            return false;
        }

        // get users with cache
        public async Task<List<ExternalUser>> GetUsersWithCacheAsync(UserFilterParams filter, int limit, int offset)
        {
            limit = Math.Min(limit, 50);

            string cacheKey = _userHelper.GenerateCacheKey(filter, limit, offset);

            try
            {
                var cached = await _userHelper.GetJsonAsync<List<ExternalUser>>(cacheKey);
                if (cached != null) return cached;
            }
            catch
            {
                // ignore cache errors
            }

            var query = GetUsersQueryable(filter)
                .OrderBy(u => u.UserId)
                .Skip(offset)
                .Take(limit)
                .Select(u => new ExternalUser
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role,
                    Status = u.Status
                });

            var dtos = await query.ToListAsync();

            try
            {
                string json = _userHelper.SerializeToJson(dtos);
                await _userHelper.SetStringAsync(cacheKey, json, TimeSpan.FromMinutes(5));
            }
            catch { }

            return dtos;
        }

        // delete user
        public async Task<bool> DeleteUserAsync(int id)
        {
            var flag = await  _userRepo.GetUserDtoByIdAsync(id);
            if (flag == null) return false;

            var success = await  _userRepo.DeleteUserDirectAsync(id);
            if (success)
            {
                await _userHelper.ClearUsersCacheAsync();
            }
            return success;
        }

        public IQueryable<ExternalUser> GetUsersQueryable(UserFilterParams filter)
        {
            var query =  _userRepo.GetAllUsersQueryable();

            if (!string.IsNullOrEmpty(filter.Role))
                query = query.Where(u => u.Role == filter.Role);

            if (!string.IsNullOrEmpty(filter.AccountStatus))
                query = query.Where(u => u.Status == filter.AccountStatus);

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                var keyword = filter.Keyword.ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(keyword) ||
                    u.Email.ToLower().Contains(keyword) ||
                    u.Phone.ToLower().Contains(keyword));
            }

            return query;
        }

        // admin update
        public async Task<bool> AdminUpdateUser(int id, AdminUpdateStatusDTO userData)
        {
            var user = await  _userRepo.GetUserDtoByIdAsync(id);
            if (user == null) return false;

            bool isUpdated = false;

            if (!string.IsNullOrWhiteSpace(userData.Status) && user.Status != userData.Status)
            {
                if (!_userValidation.IsValidString(userData.Status))
                    throw new ArgumentException("Invalid status format");

                user.Status = userData.Status.Trim();
                isUpdated = true;
            }

            if (!string.IsNullOrWhiteSpace(userData.Role) && user.Role != userData.Role)
            {
                if (!_userValidation.IsValidString(userData.Role))
                    throw new ArgumentException("Invalid role format");

                user.Role = userData.Role.Trim();
                isUpdated = true;
            }

            if (isUpdated)
            {
                user.UpdatedAt = DateTime.UtcNow;
                await  _userRepo.AdminUpdateDirectAsync(id, user);
                await _userHelper.ClearUsersCacheAsync();
            }

            return isUpdated;
        }

        // phân trang users
        public async Task<List<ExternalUser>> GetUsersAsync(UserFilterParams filter, int limit = 20, int offset = 0)
        {
            var query = GetUsersQueryable(filter);

            return await query
                .Skip(offset)
                .Take(limit)
                .Select(u => new ExternalUser
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role,
                    Status = u.Status
                })
                .ToListAsync();
        }
    }
}
