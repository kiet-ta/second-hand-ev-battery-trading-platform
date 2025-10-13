using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Net.payOS;

namespace Infrastructure.Ulties;

public class PayOSWebhookInitializer : IHostedService
{
    private readonly PayOS _payOS;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PayOSWebhookInitializer> _logger;

    public PayOSWebhookInitializer(PayOS payOS, IConfiguration configuration, ILogger<PayOSWebhookInitializer> logger)
    {
        _payOS = payOS;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var webhookUrl = _configuration["PayOS:WebhookUrl"];
        if (string.IsNullOrEmpty(webhookUrl))
        {
            _logger.LogWarning("Webhook URL is not configured.");
            return;
        }
        try
        {
            await _payOS.confirmWebhook(webhookUrl);
            _logger.LogInformation("Webhook confirmed successfully with PayOS: {WebhookUrl}", webhookUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to confirm webhook with PayOS.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    =>
        // No cleanup needed
        Task.CompletedTask;
}