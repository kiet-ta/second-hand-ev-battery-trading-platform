using Application.IRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserEntity = Domain.Entities.User;
using Domain.Entities;
using Application.IHelpers;
using Application.IValidations;
using Domain.DTOs;
using Services;

namespace Application.Services.UserServices
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository, IHasher hasher)
        {
            _userRepository = userRepository;
            _hasher = hasher;
        }

        public Task<IEnumerable<User>> GetAllUsersAsync() => _userRepository.GetAllAsync();

        public Task<User?> GetUserByIdAsync(int id) => _userRepository.GetByIdAsync(id);

        public Task<User?> GetUserByEmailAsync(string email) => _userRepository.GetByEmailAsync(email);

        public async Task AddUserAsync(User user)
        {
            var existing = await _userRepository.GetByEmailAsync(user.Email);
            if (existing != null)
                throw new InvalidOperationException("Email đã tồn tại!");

            user.CreatedAt = DateTime.Now;
            user.UpdatedAt = DateTime.Now;

            await _userRepository.AddAsync(user);
        }

        public async Task UpdateUserAsync(User user)
        {
            var existing = await _userRepository.GetByIdAsync(user.UserId);
            if (existing == null)
                throw new KeyNotFoundException("User không tồn tại!");

            // cập nhật các field cần thiết
            existing.FullName = user.FullName;
            existing.Phone = user.Phone;
            existing.Gender = user.Gender;
            existing.AvatarProfile = user.AvatarProfile;
            existing.Role = user.Role;
            existing.KycStatus = user.KycStatus;
            existing.AccountStatus = user.AccountStatus;
            existing.UpdatedAt = DateTime.Now;

            await _userRepository.UpdateAsync(existing);
        }

        public Task DeleteUserAsync(int id) => _userRepository.DeleteAsync(id);
    }
}

