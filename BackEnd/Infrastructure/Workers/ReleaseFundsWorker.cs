using Application.DTOs.AuctionDtos;
using Application.IRepositories.IBiddingRepositories;
using CloudinaryDotNet.Core;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Workers;

public class ReleaseFundsWorker : BackgroundService
{
    private readonly ILogger<ReleaseFundsWorker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly string _rabbitMQConnectionString;
    private IConnection _connection;
    private IChannel _channel;
    private const string QueueName = "release_funds_queue";
    private const string ExchangeName = "auction_exchange";
    private const string BindingKey = "bid.outbid";

    public ReleaseFundsWorker(ILogger<ReleaseFundsWorker> logger, IServiceProvider serviceProvider, string rabbitMQConnectionString)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _rabbitMQConnectionString = rabbitMQConnectionString;
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        var factory = new ConnectionFactory() { Uri = new Uri(_rabbitMQConnectionString) };
        _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();

        _channel.ExchangeDeclareAsync(
            exchange: ExchangeName,
            type: ExchangeType.Direct,
            durable: true
            );
        _channel.QueueDeclareAsync(queue: QueueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
        _channel.QueueBindAsync(queue: QueueName, exchange: ExchangeName, routingKey: BindingKey);

        _channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 1, global: false);
        // handle 1 message at a time

        _logger.LogInformation("ReleaseFundsWorker started. Waiting for messages...");

        return base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.ThrowIfCancellationRequested();

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            _logger.LogInformation($" [x] Received Outbid Event: {message}");

            OutbidEventDto? outbidEvent = null;
            try
            {
                outbidEvent = JsonSerializer.Deserialize<OutbidEventDto>(message);

                if (outbidEvent != null)
                {
                    // Resolve scoped services
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var walletRepository = scope.ServiceProvider.GetRequiredService<IWalletRepository>();
                        var walletTransactionRepository = scope.ServiceProvider.GetRequiredService<IWalletTransactionRepository>();

                        await ProcessReleaseFunds(outbidEvent, walletRepository, walletTransactionRepository);
                    }
                    // send  ack after process successfully
                    await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                else
                {
                    _logger.LogWarning("Could not deserialize message. Rejecting.");
                    await _channel.BasicRejectAsync(deliveryTag: ea.DeliveryTag, requeue: false); // don't  requeue message error format
                }
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "JSON Deserialization error. Rejecting message.");
                await _channel.BasicRejectAsync(deliveryTag: ea.DeliveryTag, requeue: false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing outbid event for Auction {outbidEvent?.AuctionId}, User {outbidEvent?.OutbidUserId}. Nacking message (will requeue).");
                await _channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                await Task.Delay(5000, stoppingToken); // delay before retrying
            }
        };

        await _channel.BasicConsumeAsync(queue: QueueName, autoAck: false, consumer: consumer); // autoAck: false ->  ack handled manually

        await Task.CompletedTask; // worker runs until stopped
    }

    private async Task ProcessReleaseFunds(OutbidEventDto outbidEvent, IWalletRepository walletRepository, IWalletTransactionRepository walletTransactionRepository)
    {
        _logger.LogInformation($"Processing release for User {outbidEvent.OutbidUserId}, Amount {outbidEvent.AmountToRelease}");

        var wallet = await walletRepository.GetWalletByUserIdAsync(outbidEvent.OutbidUserId);
        if (wallet == null)
            throw new Exception($"Wallet not found for User {outbidEvent.OutbidUserId}. Cannot release funds."); // throw for Nack and retry

        //IMPORTANCE: Check if the hold transaction has been released to avoid double release
        //Example: Check if there is a 'release' transaction for OriginalBidId ?
        //bool alreadyReleased = await walletTransactionRepository.HasReleaseTransactionForBid(outbidEvent.OriginalBidId);
        //if (alreadyReleased)
        //{
        //    _logger.LogWarning($"Funds for Bid {outbidEvent.OriginalBidId} already released for User {outbidEvent.OutbidUserId}. Skipping.");
        //    return; // Ack this message because it's already processed
        //}

        // add amount back to wallet
        bool updateSuccess = await walletRepository.UpdateBalanceAsync(wallet.WalletId, outbidEvent.AmountToRelease);
        if (!updateSuccess)
        {
            _logger.LogError($"Failed to update balance for Wallet {wallet.WalletId}.");
            throw new Exception($"Failed to update balance for Wallet {wallet.WalletId}."); // throw for Nack and retry
        }

        // create transaction release
        var releaseTransaction = new WalletTransaction
        {
            WalletId = wallet.WalletId,
            Amount = outbidEvent.AmountToRelease,
            Type = "release", //
            CreatedAt = DateTime.Now,
            RefId = outbidEvent.OriginalBidId
        };
        await walletTransactionRepository.CreateTransactionAsync(releaseTransaction);

        _logger.LogInformation($"Successfully released {outbidEvent.AmountToRelease} to Wallet {wallet.WalletId} for User {outbidEvent.OutbidUserId}");

        // TODO: sent notification real-time (SignalR) for User know funds released to wallet
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        _channel?.CloseAsync();
        _connection?.CloseAsync();
        _logger.LogInformation("ReleaseFundsWorker stopped.");
        return base.StopAsync(cancellationToken);
    }
}