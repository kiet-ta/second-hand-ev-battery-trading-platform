namespace Infrastructure.Messaging;

using Application.DTOs.AuctionDtos;
using Application.IServices;
using CloudinaryDotNet.Core;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

public class RabbitMQPublisher : IMessagePublisher, IAsyncDisposable
{
    private readonly IConnection _connection;
    private readonly IChannel _channel;
    private const string ExchangeName = "auction_exchange"; // put it to config later
    private const string OutbidRoutingKey = "bid.outbid"; // put it to config later

    public RabbitMQPublisher(string rabbitMqConnectionString)
    {
        // Initialize RabbitMQ connection and channel
        var factory = new ConnectionFactory
        {
            Uri = new Uri(rabbitMqConnectionString)
        };
        _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
        _channel.ExchangeDeclareAsync(
            exchange: ExchangeName,
            type: ExchangeType.Direct,
            durable: true
        ).GetAwaiter().GetResult();
    }

    public async void PublishOutbidEvent(OutbidEventDto outbidEvent)
    {
        var messageBody = JsonSerializer.Serialize(outbidEvent);
        var body = Encoding.UTF8.GetBytes(messageBody);

        var properties = new BasicProperties()
        {
            DeliveryMode = DeliveryModes.Persistent
        };

        // Send message with persistent delivery mode
        await _channel.BasicPublishAsync(
            exchange: ExchangeName,
            routingKey: OutbidRoutingKey,
            mandatory: false,
            basicProperties: properties,
            body: body
        );
        properties.Persistent = true; // Ensure message is not lost if RabbitMQ restarts

        await _channel.BasicPublishAsync(
            exchange: ExchangeName,
            routingKey: OutbidRoutingKey,
            mandatory: false,
            basicProperties: properties,
            body: body
        );
        Console.WriteLine($" [x] Sent Outbid Event for Auction {outbidEvent.AuctionId}, User {outbidEvent.OutbidUserId}");
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null)
            await _channel.CloseAsync();

        _connection?.CloseAsync();
    }
}