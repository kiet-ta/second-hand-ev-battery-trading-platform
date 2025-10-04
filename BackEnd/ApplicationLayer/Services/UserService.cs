using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IRepositories;
using Application.IServices;
using Domain.Entities;
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
        private readonly IUserRepository _repo;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly IConfiguration _config;


        public UserService(IUserRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
            _jwtSecret = config["Jwt:Key"]!;
            _jwtIssuer = config["Jwt:Issuer"]!;
            _jwtAudience = config["Jwt:Audience"]!;
        }
        public async Task<List<UserRoleCountDto>> GetUsersByRoleAsync()
        {
            var data = await _repo.GetUsersByRoleAsync();

            return data.Select(d => new UserRoleCountDto
            {
                Role = d.Role,
                Count = d.Count
            }).ToList();
        }

        public async Task<AuthResponseDto> AddUserAsync(CreateUserDto dto)
        {            
            var existingUser = await _repo.GetByEmailAsync(dto.Email);
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
            await _repo.AddUserAsync(newUser);
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
    }
}
