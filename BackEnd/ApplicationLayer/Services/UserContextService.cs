using Application.IServices;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public long GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                throw new UnauthorizedAccessException("No HTTP context available");

            var user = httpContext.User;
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("User not authenticated");

            // Thử lấy userId từ các claim phổ biến
            var userIdClaim = user.FindFirst("userId")?.Value
                ?? user.FindFirst("sub")?.Value
                ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                // Debug: In ra tất cả claims
                var claims = string.Join(", ", user.Claims.Select(c => $"{c.Type}={c.Value}"));
                Console.WriteLine($"Available claims: {claims}");
                throw new UnauthorizedAccessException("User ID claim not found in token");
            }

            if (!long.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException($"Invalid user ID format: {userIdClaim}");

            return userId;
        }
        public int GetUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                throw new UnauthorizedAccessException("No HTTP context available");

            var user = httpContext.User;
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("User not authenticated");

            // Thử lấy userId từ các claim phổ biến
            var userIdClaim = user.FindFirst("userId")?.Value
                ?? user.FindFirst("sub")?.Value
                ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                // Debug: In ra tất cả claims
                var claims = string.Join(", ", user.Claims.Select(c => $"{c.Type}={c.Value}"));
                Console.WriteLine($"Available claims: {claims}");
                throw new UnauthorizedAccessException("User ID claim not found in token");
            }

            if (!int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException($"Invalid user ID format: {userIdClaim}");

            return userId;
        }
    }
}
