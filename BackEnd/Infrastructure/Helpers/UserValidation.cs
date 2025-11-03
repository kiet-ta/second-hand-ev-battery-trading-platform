using Application.IHelpers;
using Application.IValidations;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace Infrastructure.Helpers
{
    public class UserValidation : IUserValidation
    {
        private static readonly Regex NameRegex = new(
            @"^[\p{L}\p{M}\p{Zs}\p{Nd}'-]+$",
            RegexOptions.Compiled
        );

        private static readonly Regex VNPhoneRegex = new(
            @"^(0|\+84)(3|5|7|8|9)\d{8}$",
            RegexOptions.Compiled
        );

        // Email validation
        private static readonly Regex EmailRegex = new(
            @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase
        );

        public bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            // Check regex trước
            if (!EmailRegex.IsMatch(email))
                return false;

            try
            {
                var addr = new MailAddress(email);
                return string.Equals(addr.Address, email, StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        // Name validation
        public bool IsValidString(string input) =>
            !string.IsNullOrWhiteSpace(input) && NameRegex.IsMatch(input);

        // Phone validation
        public bool IsValidVNPhone(string phone) =>
            !string.IsNullOrWhiteSpace(phone) && VNPhoneRegex.IsMatch(phone);

        // Strong password: ≥8 chars, 1 uppercase, lowercase, số, ký tự đặc biệt 
        public bool IsStrongPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                return false;

            bool hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;

            foreach (var c in password)
            {
                if (char.IsUpper(c)) hasUpper = true;
                else if (char.IsLower(c)) hasLower = true;
                else if (char.IsDigit(c)) hasDigit = true;
                else hasSpecial = true;

                if (hasUpper && hasLower && hasDigit && hasSpecial)
                    return true;
            }

            return false;
        }

        // Check unique email/phone
        public async Task<bool> IsEmailUniqueAsync(string email, DbContext db) =>
            !await db.Set<User>().AnyAsync(u => u.Email == email);

        public async Task<bool> IsPhoneUniqueAsync(string phone, DbContext db) =>
            !await db.Set<User>().AnyAsync(u => u.Phone == phone);
    }

    
}


