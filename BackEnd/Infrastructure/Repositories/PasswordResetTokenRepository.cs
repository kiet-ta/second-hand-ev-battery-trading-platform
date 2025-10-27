using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly EvBatteryTradingContext _context;

        public PasswordResetTokenRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Add(token);
            await _context.SaveChangesAsync();
        }

        //public async Task<PasswordResetToken?> GetValidTokenAsync(int userId, string otpCode)
        //{
        //    return await _context.PasswordResetTokens
        //        .FirstOrDefaultAsync(x => x.UserId == userId && x.OtpCode == otpCode && !x.IsUsed);
        //}

        public async Task MarkAsUsedAsync(PasswordResetToken token)
        {
            token.IsUsed = true;
            await _context.SaveChangesAsync();
        }

        public async Task<PasswordResetToken?> GetValidTokenAsync(int userId, string otpCode)
        {
            return await _context.PasswordResetTokens
              .FirstOrDefaultAsync(x => x.UserId == userId
                                       && x.OtpCode == otpCode
                                       && !x.IsUsed
                                       && x.ExpirationTime > DateTime.UtcNow);
        }
    }
}
