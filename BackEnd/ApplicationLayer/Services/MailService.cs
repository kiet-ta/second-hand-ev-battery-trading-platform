using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Threading.Tasks;
using IMailService = Application.IServices.IMailService;

namespace Application.Services
{
    public class MailService : IMailService
    {
        private readonly MailSettings _settings;
        private readonly IEmailRepository _templateRepository;

        public MailService(IOptions<MailSettings> settings, IEmailRepository templateRepository)
        {

            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _templateRepository = templateRepository ?? throw new ArgumentNullException(nameof(templateRepository));
        }

        public async Task SendWelcomeMailAsync(WelcomeDto request, string url)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.To)) throw new ArgumentException("Recipient email cannot be empty.", nameof(request.To));
            if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("URL cannot be empty.", nameof(url));

            var template = await _templateRepository.GetWelcomeTemplate(request.To, url)
                ?? throw new InvalidOperationException("Welcome email template not found.");

            var message = CreateMessage(request.To, "Welcome to Cóc Mua Xe!", template);
            await SendAsync(message);
        }

        public async Task SendBanMailAsync(BanDto request, string reason, string url)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.To)) throw new ArgumentException("Recipient email cannot be empty.", nameof(request.To));
            if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Ban reason cannot be empty.", nameof(reason));
            if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("URL cannot be empty.", nameof(url));

            var template = await _templateRepository.GetBanTemplate(request.To, reason, url)
                ?? throw new InvalidOperationException("Ban email template not found.");

            var message = CreateMessage(request.To, "Your Account Has Been Suspended", template);
            await SendAsync(message);
        }

        public async Task SendPurchaseSuccessMailAsync(PurchaseSuccessDto request, string orderId, string url)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.To)) throw new ArgumentException("Recipient email cannot be empty.", nameof(request.To));
            if (string.IsNullOrWhiteSpace(orderId)) throw new ArgumentException("Order ID cannot be empty.", nameof(orderId));
            if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("URL cannot be empty.", nameof(url));

            var template = await _templateRepository.GetPurchaseSuccessTemplate(request.To, orderId, url)
                ?? throw new InvalidOperationException("Purchase success template not found.");

            var message = CreateMessage(request.To, $"Order #{orderId} Successfully Placed", template);
            await SendAsync(message);
        }

        public async Task SendPurchaseFailedMailAsync(PurchaseFailedDto request, string orderId, string reason, string url)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.To)) throw new ArgumentException("Recipient email cannot be empty.", nameof(request.To));
            if (string.IsNullOrWhiteSpace(orderId)) throw new ArgumentException("Order ID cannot be empty.", nameof(orderId));
            if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Failure reason cannot be empty.", nameof(reason));
            if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("URL cannot be empty.", nameof(url));

            var template = await _templateRepository.GetPurchaseFailedTemplate(request.To, orderId, reason, url)
                ?? throw new InvalidOperationException("Purchase failed template not found.");

            var message = CreateMessage(request.To, $"Order #{orderId} Failed", template);
            await SendAsync(message);
        }

        public async Task SendNewStaffMailAsync(NewStaffTemplateDto request, string logoUrl)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.To)) throw new ArgumentException("Recipient email cannot be empty.", nameof(request.To));
            if (string.IsNullOrWhiteSpace(request.Password)) throw new ArgumentException("Password cannot be empty.", nameof(request.Password));
            if (string.IsNullOrWhiteSpace(request.ActionUrl)) throw new ArgumentException("Action URL cannot be empty.", nameof(request.ActionUrl));
            if (string.IsNullOrWhiteSpace(logoUrl)) throw new ArgumentException("Logo URL cannot be empty.", nameof(logoUrl));

            var template = await _templateRepository.GetNewStaffTemplateAsync(
                request.To, request.Password, request.ActionUrl, logoUrl)
                ?? throw new InvalidOperationException("New staff template not found.");

            var message = CreateMessage(request.To, "Cóc Mua Xe - Your Account is Ready!", template);
            await SendAsync(message);
        }

        public async Task SendResponseComplaintMailAsync(CreateResponseMailDto dto, string staffName, string staffRole)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.To)) throw new ArgumentException("Recipient email cannot be empty.", nameof(dto.To));
            if (string.IsNullOrWhiteSpace(staffName)) throw new ArgumentException("Staff name cannot be empty.", nameof(staffName));
            if (string.IsNullOrWhiteSpace(staffRole)) throw new ArgumentException("Staff role cannot be empty.", nameof(staffRole));
  

            string htmlContent = await _templateRepository.SendResponseEmailToUser(dto, staffName, staffRole);

            var message = CreateMessage(dto.To, $"Phản hồi khiếu nại #{dto.complaintId}", htmlContent);
            await SendAsync(message);
        }


        private MimeMessage CreateMessage(string toEmail, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(toEmail)) throw new ArgumentException("Recipient email cannot be empty.", nameof(toEmail));
            if (string.IsNullOrWhiteSpace(subject)) throw new ArgumentException("Email subject cannot be empty.", nameof(subject));
            if (string.IsNullOrWhiteSpace(htmlBody)) throw new ArgumentException("Email body cannot be empty.", nameof(htmlBody));

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };
            return message;
        }

        private async Task SendAsync(MimeMessage message)
        {
            if (message == null) throw new ArgumentNullException(nameof(message));

            using var client = new SmtpClient(new ProtocolLogger("smtp.log"));

            try
            {
                await client.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
                await client.SendAsync(message);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Failed to send email to {string.Join(", ", message.To)}. Reason: {ex.Message}", ex);
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        public async Task SendOtpMailAsync(string toEmail, string otp, string systemUrl)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Recipient email cannot be empty.", nameof(toEmail));

            if (string.IsNullOrWhiteSpace(otp))
                throw new ArgumentException("OTP cannot be empty.", nameof(otp));

            if (string.IsNullOrWhiteSpace(systemUrl))
                throw new ArgumentException("System URL cannot be empty.", nameof(systemUrl));

            var template = await _templateRepository.GetForgotPasswordTemplate(
                email: toEmail,
                to: toEmail,
                otp: otp,
                systemUrl: systemUrl
            ) ?? throw new InvalidOperationException("Forgot password email template not found.");

            var message = CreateMessage(toEmail, "Reset Your Password - Cóc Mua Xe", template);
            await SendAsync(message);
        }

        public async Task SendPasswordChangedMailAsync(string toEmail, string loginUrl)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Recipient email cannot be empty.", nameof(toEmail));

            if (string.IsNullOrWhiteSpace(loginUrl))
                throw new ArgumentException("Login URL cannot be empty.", nameof(loginUrl));

            var template = await _templateRepository.GetPasswordChangedTemplate(
                email: toEmail,
                to: toEmail,
                loginUrl: loginUrl
            ) ?? throw new InvalidOperationException("Password changed email template not found.");

            var message = CreateMessage(toEmail, "Your Password Has Been Changed", template);
            await SendAsync(message);
        }
    }
}
