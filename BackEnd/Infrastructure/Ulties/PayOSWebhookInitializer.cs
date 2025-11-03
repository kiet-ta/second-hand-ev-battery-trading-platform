using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Net.payOS;
using System.Net.WebSockets;

namespace Infrastructure.Ulties;

public class PayOSWebhookInitializer : IHostedService
{
    private readonly PayOS _payOS;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PayOSWebhookInitializer> _logger;
    private readonly IHostApplicationLifetime _appLifetime;
    public PayOSWebhookInitializer(PayOS payOS, IConfiguration configuration, ILogger<PayOSWebhookInitializer> logger, IHostApplicationLifetime appLifetime)
    {
        _payOS = payOS;
        _configuration = configuration;
        _logger = logger;
        _appLifetime = appLifetime;

        _appLifetime.ApplicationStarted.Register(OnApplicationStarted);
    }
    private async void OnApplicationStarted()
    {
        _logger.LogInformation("Application started. Initiating PayOS webhook confirmation...");
        await StartAsync(_appLifetime.ApplicationStopping);
    }
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var webhookUrl = _configuration["PayOS:WebhookUrl"];
        if (string.IsNullOrEmpty(webhookUrl))
        {
            _logger.LogWarning("Webhook URL is not configured.");
            return;
        }

        using var httpClient = new HttpClient();
        var clientId = _configuration["PayOS:Client_ID"];
        var apiKey = _configuration["PayOS:Api_Key"];

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("PayOS Client_ID or Api_Key is not configured properly.");
            return;
        }

        httpClient.DefaultRequestHeaders.Add("x-client-id", clientId);
        httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);

        var payload = new { webhookUrl = webhookUrl };
        var jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload);
        var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

        try
        {
            var response = await httpClient.PostAsync("https://api-merchant.payos.vn/confirm-webhook", content, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Webhook confirmed successfully");
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to confirm webhook via HttpClient. Status: {StatusCode}, Response: {ErrorContent}", response.StatusCode, errorContent);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while confirming webhook via HttpClient.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    =>
        // No cleanup needed
        Task.CompletedTask;
}