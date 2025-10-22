using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IHelpers;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly IConfiguration _config;

        public UserService(IUserRepository userRepository, IConfiguration config)
        {
            _userRepository = userRepository;
            _config = config;
            _jwtSecret = config["Jwt:Key"]!;
            _jwtIssuer = config["Jwt:Issuer"]!;
            _jwtAudience = config["Jwt:Audience"]!;
        }

        public async Task<List<UserRoleCountDto>> GetUsersByRoleAsync()
        {
            var data = await _userRepository.GetUsersByRoleAsync();

            return data.Select(d => new UserRoleCountDto
            {
                Role = d.Role,
                Count = d.Count
            }).ToList();
        }

        public async Task<AuthResponseDto> AddUserAsync(CreateUserDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new Exception("Email already registered");

            var newUser = new User
            {
                UserId = dto.UserId,
                FullName = dto.FullName,
                YearOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Role = dto.Role,
            };
            await _userRepository.AddAsync(newUser);
            return GenerateToken(newUser);
        }

        private AuthResponseDto GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecret);
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new AuthResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Token = tokenHandler.WriteToken(token)
            };
        }

        public Task<IEnumerable<User>> GetAllUsersAsync() => _userRepository.GetAllAsync();

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }


        public Task<User?> GetUserByEmailAsync(string email) => _userRepository.GetByEmailAsync(email);

        public async Task AddUserAsync(User user)
        {
            var existing = await _userRepository.GetByEmailAsync(user.Email);
            if (existing != null)
                throw new InvalidOperationException("Email does not exist");

            user.CreatedAt = DateTime.Now;
            user.UpdatedAt = DateTime.Now;

            await _userRepository.AddAsync(user);
        }

        public async Task UpdateUserAsync(User user)
        {
            var existing = await _userRepository.GetByIdAsync(user.UserId);
            if (existing == null)
                throw new KeyNotFoundException("User does not exist");

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

        public async Task<string?> GetAvatarAsync(int userId)
        {
            if (_userRepository == null)
                throw new Exception("_userRepository is NULL");
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            return user.AvatarProfile;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            if (request.NewPassword != request.ConfirmPassword)
                throw new ArgumentException("Confirmation password does not match.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException("User not found.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isPasswordValid)
                throw new UnauthorizedAccessException("The current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _userRepository.UpdateAsync(user);

            return true;
        }
        public async Task<PagedResultUser<UserListResponseDto>> GetAllUsersAsync(int page, int pageSize)
        {
            var (users, totalCount) = await _userRepository.GetAllPagedAsync(page, pageSize);

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var mapped = users.Select(u => new UserListResponseDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                AccountStatus = u.AccountStatus
            });

            return new PagedResultUser<UserListResponseDto>
            {
                Items = mapped,
                TotalItems = totalCount,
                TotalPages = totalPages
            };
        }
    }
}