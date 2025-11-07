using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Application.Services
{
    public class UserService : IUserService
    {

        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly IConfiguration _config;
        private readonly IUnitOfWork _unitOfWork;


        public UserService(IConfiguration config, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _config = config;
            _jwtSecret = config["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key", "JWT key is missing from configuration.");
            _jwtIssuer = config["Jwt:Issuer"] ?? throw new ArgumentNullException("Jwt:Issuer", "JWT issuer is missing from configuration.");
            _jwtAudience = config["Jwt:Audience"] ?? throw new ArgumentNullException("Jwt:Audience", "JWT audience is missing from configuration.");
        }

        public async Task<List<UserRoleCountDto>> GetUsersByRoleAsync()
        {
            var data = await _unitOfWork.Users.GetUsersByRoleAsync();
            if (data == null || !data.Any())
                throw new InvalidOperationException("No users found by role.");

            return data.Select(d => new UserRoleCountDto
            {
                Role = d.Role,
                Count = d.Count
            }).ToList();
        }

        public async Task<AuthResponseDto> AddUserAsync(CreateUserDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "User data cannot be null.");

            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Email and password are required.");

            var existingUser = await _unitOfWork.Users.GetByEmailAsync(dto.Email);
            if (existingUser != null)
                throw new InvalidOperationException("Email already registered.");

            var newUser = new User
            {
                FullName = dto.FullName,
                YearOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Users.AddAsync(newUser);
            return GenerateToken(newUser);
        }

        private AuthResponseDto GenerateToken(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "User cannot be null when generating token.");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = _jwtIssuer,
                Audience = _jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new AuthResponseDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Token = tokenHandler.WriteToken(token)
            };
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            if (users == null)
                throw new InvalidOperationException("No users found.");

            return users;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid user ID.");

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"User with ID {id} not found.");

            return user;
        }

        public Task<User?> GetUserByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be empty.");
            return _unitOfWork.Users.GetByEmailAsync(email);
        }

        public async Task AddUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "User data cannot be null.");

            var existing = await _unitOfWork.Users.GetByEmailAsync(user.Email);
            if (existing != null)
                throw new InvalidOperationException("Email already exists.");

            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Users.AddAsync(user);
        }

        public async Task UpdateUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "User data cannot be null.");

            var existing = await _unitOfWork.Users.GetByIdAsync(user.UserId);
            if (existing == null)
                throw new KeyNotFoundException($"User with ID {user.UserId} not found.");

            existing.FullName = user.FullName;
            existing.Phone = user.Phone;
            existing.Gender = user.Gender;
            existing.AvatarProfile = user.AvatarProfile;
            existing.Role = user.Role;
            existing.KycStatus = user.KycStatus;
            existing.AccountStatus = user.AccountStatus;
            existing.YearOfBirth = user.YearOfBirth;
            existing.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Users.UpdateAsync(existing);
            await _unitOfWork.Users.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid user ID.");

            await _unitOfWork.Users.DeleteAsync(id);
        }

        public async Task<string?> GetAvatarAsync(int userId)
        {
            if (userId <= 0)
                throw new ArgumentException("Invalid user ID.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found.");

            return user.AvatarProfile;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Password change request cannot be null.");

            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                throw new ArgumentException("Passwords cannot be empty.");

            if (request.NewPassword != request.ConfirmPassword)
                throw new ArgumentException("Confirmation password does not match.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException($"User with ID {userId} not found or has been deleted.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isPasswordValid)
                throw new UnauthorizedAccessException("The current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.Users.SaveChangesAsync();

            return true;
        }

        public async Task<PagedResultUser<UserListResponseDto>> GetAllUsersAsync(int page, int pageSize)
        {
            if (page <= 0 || pageSize <= 0)
                throw new ArgumentException("Page and page size must be greater than zero.");

            var (users, totalCount) = await _unitOfWork.Users.GetAllPagedAsync(page, pageSize);

            if (users == null)
                throw new InvalidOperationException("Failed to retrieve user list.");

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var mapped = users.Select(u => new UserListResponseDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                AccountStatus = u.AccountStatus,
                CreatedAt = u.CreatedAt
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
