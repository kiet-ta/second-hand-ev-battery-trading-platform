using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IRepositories
{
    public interface IPasswordResetTokenRepository
    {
        Task CreateAsync(PasswordResetToken token);
        Task<PasswordResetToken?> GetValidTokenAsync(int userId, string otpCode);
        Task MarkAsUsedAsync(PasswordResetToken token);
    }
}
