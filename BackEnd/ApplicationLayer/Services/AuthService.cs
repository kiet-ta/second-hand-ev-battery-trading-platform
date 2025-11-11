using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IServices;
using Application.Validations;
using Domain.Common.Constants;
using Domain.Entities;
using FluentValidation;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services
{
    public class InvalidGoogleTokenException : Exception
    {
        public InvalidGoogleTokenException(string? message = null) : base(message) { }
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _otpRepository;
        private readonly IMailService _emailSender;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly IConfiguration _config;
        private readonly AppSetting _appSettings;
        private readonly ILogger<AuthService> _logger;
        private readonly IUnitOfWork _uow;

        public AuthService(
            IUserRepository userRepository,
            IConfiguration config,
            IOptionsMonitor<AppSetting> option,
            ILogger<AuthService> logger,
            IPasswordResetTokenRepository otpRepository,
            IMailService emailSender,
            IUnitOfWork uow)
        {
            _userRepository = userRepository;
            _config = config;
            _jwtSecret = config["Jwt:Key"]!;
            _jwtIssuer = config["Jwt:Issuer"]!;
            _jwtAudience = config["Jwt:Audience"]!;
            _appSettings = option.CurrentValue;
            _logger = logger;
            _otpRepository = otpRepository;
            _emailSender = emailSender;
            _uow = uow;
        }

        public static int GenerateUserId()
        {
            var now = DateTime.Now;
            string timestamp = now.ToString("yyyyMMddHHmmss");
            int random = new Random().Next(100, 999);
            string combined = timestamp + random.ToString();
            int hash = combined.GetHashCode();
            return Math.Abs(hash);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var validator = new RegisterValidator();
            var result = validator.Validate(dto);
            if (!result.IsValid)
                throw new ValidationException(string.Join("; ", result.Errors.Select(e => e.ErrorMessage)));
            try
            {
                if (await _uow.Users.GetByEmailAsync(dto.Email) != null)
                    throw new ValidationException("Email already registered");

                var user = new User
                {
                    UserId = GenerateUserId(),
                    FullName = dto.FullName.Trim(),
                    Email = dto.Email.ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = "buyer",
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsDeleted = false,
                    KycStatus = KycStatus.Not_submitted.ToString(),
                    AccountStatus = UserStatus.Active.ToString(),
                    Paid = UserPaid.Pending_Pay.ToString()
                };
                await _uow.Users.AddAsync(user);
                await _uow.SaveChangesAsync();
                var sellected = await _userRepository.GetByIdAsync(user.UserId);
                var wallet = new Wallet
                {
                    UserId = sellected.UserId,
                    Balance = 0,
                    HeldBalance = 0,
                    Currency = "vnd",
                    Status = UserStatus.Active.ToString(),
                    UpdatedAt = DateTime.UtcNow
                };
                await _uow.Wallets.AddAsync(wallet);
                return GenerateToken(user);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null)
                throw new InvalidOperationException("Invalid email");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new InvalidOperationException("Invalid password");

            return GenerateToken(user);
        }

        public async Task<AuthResponseDto> LoginWithGoogleAsync(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
                throw new InvalidGoogleTokenException("Token is empty");

            // Log to debug
            _logger.LogInformation("Attempting to validate Google token");
            _logger.LogInformation("GoogleClientId from config: {ClientId}", _appSettings.GoogleClientId);

            GoogleJsonWebSignature.Payload payload;
            try
            {
                // Validate Google ID token với nhiều audience options
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _appSettings.GoogleClientId }
                };
                Console.WriteLine("GoogleClientId used for validation: ", _appSettings.GoogleClientId);

                payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                _logger.LogInformation("Google token validated successfully for email: {Email}", payload.Email);
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogError(ex, "Invalid JWT token: {Message}", ex.Message);
                throw new InvalidGoogleTokenException($"Invalid JWT: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google token validation failed: {Message}", ex.Message);
                throw new InvalidGoogleTokenException($"Token validation failed: {ex.Message}");
            }

            // Validate payload
            if (string.IsNullOrWhiteSpace(payload.Email))
            {
                _logger.LogWarning("Google token does not contain email");
                throw new InvalidGoogleTokenException("Google token does not contain an email.");
            }

            // Check if email is verified by Google
            if (!payload.EmailVerified)
            {
                _logger.LogWarning("Google email not verified: {Email}", payload.Email);
                throw new InvalidGoogleTokenException("Google email is not verified.");
            }

            var email = payload.Email.Trim().ToLowerInvariant();

            // Check if user exists
            var existing = await _userRepository.GetByEmailAsync(email);

            if (existing != null)
            {
                _logger.LogInformation("User found, generating token for: {Email}", email);
                return GenerateToken(existing, provider: "google");
            }

            // Create new user from Google account
            _logger.LogInformation("Creating new user from Google account: {Email}", email);

            var baseUsername = payload.Email.Split('@')[0].Replace(".", "").Replace("-", "");
            var username = await GenerateUniqueUsernameAsync(baseUsername);

            var newUser = new User
            {
                UserId = GenerateUserId(),
                FullName = string.IsNullOrWhiteSpace(payload.Name) ? username : payload.Name,
                Email = email,
                PasswordHash = string.Empty, // No password for Google login
                Role = "buyer",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsDeleted = false,
                AvatarProfile = payload.Picture // Save Google profile picture
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveChangesAsync();

            var sellected = await _userRepository.GetByIdAsync(newUser.UserId);
            var wallet = new Wallet
            {
                UserId = sellected.UserId,
                Balance = 0,
                HeldBalance = 0,
                Currency = "vnd",
                Status = UserStatus.Active.ToString(),
                UpdatedAt = DateTime.UtcNow
            };
            await _uow.Wallets.AddAsync(wallet);

            _logger.LogInformation("New user created successfully: {UserId}", newUser.UserId);

            return GenerateToken(newUser, provider: "google");
        }

        private async Task<string> GenerateUniqueUsernameAsync(string baseUsername)
        {
            var username = baseUsername;
            var counter = 1;

            while (await _userRepository.ExistsByUsernameAsync(username))
            {
                username = $"{baseUsername}{counter}";
                counter++;

                // Safety: avoid infinite loop
                if (counter > 1000)
                {
                    username = $"{baseUsername}{Guid.NewGuid().ToString("N").Substring(0, 6)}";
                    break;
                }
            }

            return username;
        }

        private AuthResponseDto GenerateToken(User user, string provider = "local")
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecret);
            var expires = DateTime.Now.AddHours(24); // 24 hours token

            var claims = new List<Claim>
            {
                new Claim("user_id", user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role ?? "buyer"),
                new Claim("auth_provider", provider)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expires,
                Issuer = _jwtIssuer,
                Audience = _jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role ?? "buyer",
                Token = tokenString,
                ExpiresAt = expires,
                AuthProvider = provider
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            if (request.NewPassword != request.ConfirmPassword)
                throw new ArgumentException("Confirmation password does not match.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || user.IsDeleted)
                throw new KeyNotFoundException("User not found.");

            // Check if user has password (not Google login)
            if (string.IsNullOrEmpty(user.PasswordHash))
                throw new InvalidOperationException("Cannot change password for Google login users.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isPasswordValid)
                throw new UnauthorizedAccessException("The current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.Now;

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
            return true;
        }

        public async Task SendOtpAsync(ForgotPasswordRequestDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("Email not found.");

            string otp = GenerateOtp();
            var token = new PasswordResetToken
            {
                UserId = user.UserId,
                OtpCode = otp,
                ExpirationTime = DateTime.Now.AddMinutes(5)
            };

            await _otpRepository.CreateAsync(token);

            string systemUrl = "https://your-website.com/reset-password"; // Try

            await _emailSender.SendOtpMailAsync(
                dto.Email,  
                otp,        
                systemUrl   
            );
        }

        public async Task<bool> VerifyOtpAsync(VerifyOtpDto dto)
        {
            try
            {
                await ValidateOtpAndGetUserAsync(dto.Email, dto.OtpCode);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                throw new Exception("Passwords do not match. Please try again.");
            }
            User user = await ValidateOtpAndGetUserAsync(dto.Email, dto.OtpCode);

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        private string GenerateOtp()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            int code = BitConverter.ToInt32(bytes, 0);
            return Math.Abs(code % 1000000).ToString("D6");
        }

        private async Task<User> ValidateOtpAndGetUserAsync(string email, string otpCode)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                throw new Exception("Email not found.");

            var token = await _otpRepository.GetValidTokenAsync(user.UserId, otpCode);
            if (token == null)
                throw new Exception("Invalid OTP code.");

            if (token.ExpirationTime < DateTime.Now)
                throw new Exception("Your OTP has expired. Please request a new one.");

            await _otpRepository.MarkAsUsedAsync(token);

            return user;
        }
    }
}