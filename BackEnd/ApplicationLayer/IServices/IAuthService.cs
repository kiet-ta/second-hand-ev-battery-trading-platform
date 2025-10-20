using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IServices
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);

        Task<AuthResponseDto> LoginAsync(LoginDto dto);

        Task<AuthResponseDto> LoginWithGoogleAsync(string idToken);

        Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);
    }
}
