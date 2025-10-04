using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IUserService
    {
        Task<List<UserRoleCountDto>> GetUsersByRoleAsync();
        Task<AuthResponseDto> AddUserAsync(CreateUserDto dto);
        //Task<List<UserRoleCountDto>> GetSeller();
        //Task<List<UserRoleCountDto>> GetStaff(int id);
    }
}
