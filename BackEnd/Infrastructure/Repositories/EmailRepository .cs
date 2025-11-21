using Application.DTOs;
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
        public async Task<string> GetNewStaffTemplateAsync(string email, string password, string actionUrl, string logoUrl)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return NewStaffTemplate.GetHtmlTemplate(
                fullName: user.FullName,
                email: user.Email,
                temporaryPassword: password,
                loginUrl: actionUrl,
                logoUrl: logoUrl
            );
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
        private async Task<Complaint> GetComplaint(int id)
        {
            return await _context.Complaints.FirstOrDefaultAsync(c => c.ComplaintId == id);
        }
        public async Task<User> GetUserByComplaintId(int complaintId)
        {
            var complaint = await GetComplaint(complaintId);
            if (complaint == null) throw new Exception("Complaint not found");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == complaint.UserId);
            if (user == null) throw new Exception("User not found");
            return user;
        }

        public async Task<string> SendResponseEmailToUser(CreateResponseMailDto dto, string staffName, string staffRole)
        {
            var u = await GetUserByComplaintId(dto.complaintId);
            var user = await GetUserByEmail(u.Email);
            if (user == null) throw new Exception("User not found");

            var complaint = await GetComplaint(dto.complaintId);
            if (string.IsNullOrWhiteSpace(user.FullName))
                throw new Exception("User full name is missing.");

            if (complaint == null)
                throw new Exception($"Complaint with ID {dto.complaintId} not found.");

            if (string.IsNullOrWhiteSpace(complaint.Reason))
                throw new Exception("Complaint reason is missing.");

            if (string.IsNullOrWhiteSpace(dto.handlingDetails))
                throw new Exception("Handling details are missing.");

            if (string.IsNullOrWhiteSpace(dto.ticketLink))
                throw new Exception("Ticket link is missing.");

            if (string.IsNullOrWhiteSpace(dto.supportEmail))
                throw new Exception("Support email is missing.");

            if (string.IsNullOrWhiteSpace(dto.supportPhone))
                throw new Exception("Support phone is missing.");

            string htmlContent = ResponseComplaintTemplate.Build(
                dto.complaintId,
                user.FullName,
                complaint.Reason,
                complaint.CreatedAt.ToString("dd/MM/yyyy"),
                complaint.SeverityLevel,
                dto.handlingDetails,
                dto.ticketLink,
                dto.supportEmail,
                staffName,
                staffRole,
                dto.supportPhone
               
            );

            return htmlContent; 
        }




        public async Task<string?> GetForgotPasswordTemplate(string email, string to, string otp, string systemUrl)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return ForgotPasswordTemplate.Build(
                user.FullName,
                to,
                otp: otp,
                systemUrl: systemUrl
            );
        }

        public async Task<string?> GetPasswordChangedTemplate(string email, string to, string loginUrl)
        {
            var user = await GetUserByEmail(email);
            if (user == null) throw new Exception("User not found");

            return PasswordChangedTemplate.Build(
                user.FullName,
                to,
                loginUrl: loginUrl
            );
        }
    }
}