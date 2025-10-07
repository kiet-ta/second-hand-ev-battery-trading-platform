using Application.DTOs;
using Application.IRepositories;
using Application.IServices;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using System.Threading.Tasks;

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

            var message = CreateMessage(request.To, "Welcome to Cóc Mua Xe! 🚗", template);
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

            var message = CreateMessage(request.To, $"Order #{orderId} Successfully Placed 🎉", template);
            await SendAsync(message);
        }

        public async Task SendPurchaseFailedMailAsync(PurchaseFailedDto request, string orderId, string reason, string url)
        {
            var template = await _templateRepository.GetPurchaseFailedTemplate(request.To, orderId, reason, url);

            var message = CreateMessage(request.To, $"Order #{orderId} Failed", template);
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
            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.SmtpServer, _settings.Port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
