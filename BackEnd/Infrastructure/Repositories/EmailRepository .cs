using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Ulties;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class EmailTemplateRepository : IEmailRepository
    {
        private readonly EvBatteryTradingContext _context;

        public EmailTemplateRepository(EvBatteryTradingContext context)
        {
            _context = context;
        }

        public async Task<string> GetWelcomeTemplate(string email, string url)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return WelcomeTemplate.Build(url, user.FullName);
        }

        public async Task<string> GetBanTemplate(string email, string reason, string url)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return BanTemplate.Build(url, user.FullName, reason);
        }

        public async Task<string> GetPurchaseSuccessTemplate(string email, string orderId, string url)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return PurchaseSuccessTemplate.Build(orderId, url, user.FullName);
        }

        public async Task<string> GetPurchaseFailedTemplate(string email, string orderId, string reason, string url)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return PurchaseFailedTemplate.Build(orderId, url, user.FullName, reason);
        }

        private async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}