using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Domain.Entities;
using Microsoft.AspNetCore.Http;


namespace Application.IServices
{
    public interface IUserService
    {
        Task<List<UserRoleCountDto>> GetUsersByRoleAsync();
        Task<AuthResponseDto> AddUserAsync(CreateUserDto dto);
        //Task<List<UserRoleCountDto>> GetSeller();
        //Task<List<UserRoleCountDto>> GetStaff(int id);
        Task<IEnumerable<User>> GetAllUsersAsync();

        Task<User?> GetUserByIdAsync(int id);

        Task<User?> GetUserByEmailAsync(string email);

        Task AddUserAsync(User user);

        Task UpdateUserAsync(User user);

        Task DeleteUserAsync(int id);

        Task<string?> GetAvatarAsync(int userId);

    }
}