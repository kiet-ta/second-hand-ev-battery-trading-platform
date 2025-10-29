namespace Infrastructure.Messaging;

public class RabbitMQSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string AuctionExchange { get; set; } = string.Empty;
    public string ReleaseFundsQueue { get; set; } = string.Empty;
    public string ReleaseFundsRoutingKey { get; set; } = string.Empty;
    public string ReleaseFundsDLX { get; set; } = string.Empty;
    public string ReleaseFundsDLQ { get; set; } = string.Empty;
}