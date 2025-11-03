using Application.DTOs.AuthenticationDtos;
using Application.DTOs.UserDtos;
using Application.IServices;
using Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PresentationLayer.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Register new user with email and password
        /// POST /api/auth/register
        /// </summary>
        [HttpPost("users")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);
                return Ok(new
                {
                    success = true,
                    message = "Registration successful",
                    data = result
                });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, new { success = false, error = ex.StackTrace });
            }
        }

        /// <summary>
        /// Login with email and password
        /// POST /api/auth/login
        /// </summary>
        [HttpPost("tokens")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// Login with Google OAuth
        /// POST /api/auth/google
        /// </summary>
        [HttpPost("tokens/google")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Credential))
            {
                _logger.LogWarning("Google login attempted with empty credential");
                return BadRequest(new
                {
                    success = false,
                    error = "Missing Google ID Token"
                });
            }

            try
            {
                _logger.LogInformation("Processing Google login with token length: {Length}", dto.Credential.Length);
                var result = await _authService.LoginWithGoogleAsync(dto.Credential);

                return Ok(new
                {
                    success = true,
                    message = "Google login successful",
                    data = result
                });
            }
            catch (InvalidGoogleTokenException ex)
            {
                _logger.LogWarning(ex, "Invalid Google token");
                return Unauthorized(new
                {
                    success = false,
                    error = "Invalid Google ID Token",
                    details = ex.Message
                });
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed during Google login");
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in GoogleLogin");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Internal server error",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Change password for authenticated user
        /// PUT /api/auth/change-password
        /// </summary>
        [HttpPut("users/me/password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { success = false, error = "User not authenticated" });
                }

                int userId = int.Parse(userIdClaim);
                await _authService.ChangePasswordAsync(userId, request);

                return Ok(new
                {
                    success = true,
                    message = "Password changed successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, new { success = false, error = "Internal server error" });
            }
        }
        /// <summary>
        /// POST /api/auth/forgot-password
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost("password-resets")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequestDto dto)
        {
            await _authService.SendOtpAsync(dto);
            return Ok(new { message = "OTP sent to your email." });
        }

        /// <summary>
        /// POST /api/auth/reset-password/otp
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>

        [HttpPost("password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            await _authService.ResetPasswordAsync(dto);
            return Ok(new { message = "Password updated successfully." });
        }
    }
}