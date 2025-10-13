using Application.DTOs.AuthenticationDtos;
using Application.IRepositories;
using Application.IServices;
using Application.Validations;
using Domain.Entities;
using FluentValidation;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepository, IConfiguration config)
        {
            _userRepository = userRepository;
            _config = config;
            _jwtSecret = config["Jwt:Key"]!;
            _jwtIssuer = config["Jwt:Issuer"]!;
            _jwtAudience = config["Jwt:Audience"]!;
        }

        public static int GenerateUserId()
        {
            var now = DateTime.Now; // hoặc DateTime.UtcNow
            string timestamp = now.ToString("yyyyMMdd"); // VD: 20251006194532123
            int random = new Random().Next(1, 9); // thêm phần ngẫu nhiên 3 số
            string combined = timestamp + random.ToString();

            // vì int chỉ tối đa 2,147,483,647 nên ta rút gọn bớt
            int hash = combined.GetHashCode();
            return Math.Abs(hash); // luôn dương
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            // 1️⃣ Validate input
            var validator = new RegisterValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(string.Join("; ", result.Errors.Select(e => e.ErrorMessage)));

            // 2️⃣ Business validate
            if (await _userRepository.GetByEmailAsync(dto.Email) != null)
                throw new ValidationException("Email already registered");

            // Optional: check phone unique
            var existingUsers = await _userRepository.GetAllAsync();
            if (existingUsers.Any(u => u.Phone == dto.Phone))
                throw new ValidationException("Phone number already used");

            // 3️⃣ Hash password + Save
            var user = new User
            {
                UserId = GenerateUserId(),
                FullName = dto.FullName.Trim(),
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Role = "Buyer"
            };

            await _userRepository.AddAsync(user);

            // 4️⃣ Optionally: send verification email (todo: EmailService)
            // await _emailService.SendVerificationAsync(user.Email, token);

            return GenerateToken(user);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null)
                throw new ValidationException("Invalid credentials.");

            if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
                throw new ValidationException("Account is locked. Try again later.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 3)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(5);
                    user.FailedLoginAttempts = 0;
                }
                await _userRepository.UpdateAsync(user);
                throw new ValidationException("Invalid credentials.");
            }

            // reset fail count
            user.FailedLoginAttempts = 0;
            await _userRepository.UpdateAsync(user);

            return GenerateToken(user);
        }

        public async Task<AuthResponseDto> LoginWithGoogleAsync(string idToken)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);

            var user = await _userRepository.GetByEmailAsync(payload.Email);

            if (user == null)
            {
                user = new User
                {
                    UserId = GenerateUserId(),
                    FullName = payload.Name,
                    Email = payload.Email,
                    PasswordHash = "", // Google user haven't password local
                    Role = "Buyer"
                };
                await _userRepository.AddAsync(user);
            }

            return GenerateToken(user);
        }

        private AuthResponseDto GenerateToken(User user, string provider = "local")
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecret);
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            var expires = DateTime.UtcNow.AddHours(2);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("user_id", user.UserId.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role ?? "Buyer")
                }),
                Expires = expires,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role ?? "Buyer",
                Token = tokenHandler.WriteToken(token),
                ExpiresAt = expires,
                AuthProvider = provider
            };
        }
    }
}