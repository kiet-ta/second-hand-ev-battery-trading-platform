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
            _settings = settings.Value;
            _templateRepository = templateRepository;
        }

        public async Task SendWelcomeMailAsync(WelcomeDto request, string url)
        {
            var template = await _templateRepository.GetWelcomeTemplate(request.To, url);
            var message = CreateMessage(request.To, "Welcome to Cóc Mua Xe!", template);
            await SendAsync(message);
        }

        public async Task SendBanMailAsync(BanDto request, string reason, string url)
        {
            var template = await _templateRepository.GetBanTemplate(request.To, reason, url);
            var message = CreateMessage(request.To, "Your Account Has Been Suspended", template);
            await SendAsync(message);
        }

        public async Task SendPurchaseSuccessMailAsync(PurchaseSuccessDto request, string orderId, string url)
        {
            var template = await _templateRepository.GetPurchaseSuccessTemplate(request.To, orderId, url);
            var message = CreateMessage(request.To, $"Order #{orderId} Successfully Placed", template);
            await SendAsync(message);
        }

        public async Task SendPurchaseFailedMailAsync(PurchaseFailedDto request, string orderId, string reason, string url)
        {
            var template = await _templateRepository.GetPurchaseFailedTemplate(request.To, orderId, reason, url);
            var message = CreateMessage(request.To, $"Order #{orderId} Failed", template);
            await SendAsync(message);
        }

        public async Task SendNewStaffMailAsync(NewStaffTemplateDto request, string logoUrl)
        {
            var template = await _templateRepository.GetNewStaffTemplateAsync(
                email: request.To,
                password: request.Password,
                actionUrl: request.ActionUrl,
                logoUrl: logoUrl
            );
            var message = CreateMessage(request.To, "Cóc Mua Xe - Your Account is Ready!", template);
            await SendAsync(message);
        }

        private MimeMessage CreateMessage(string toEmail, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };
            return message;
        }

        private async Task SendAsync(MimeMessage message)
        {
            // Bật logging chi tiết SMTP
            using var client = new SmtpClient(new ProtocolLogger("smtp.log"));

            try
            {
                await client.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
                await client.SendAsync(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending mail: {ex.Message}");
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
