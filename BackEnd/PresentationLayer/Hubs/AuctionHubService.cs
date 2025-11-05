using Application.DTOs.AuctionDtos;
using Application.IServices;
using Microsoft.AspNetCore.SignalR;

namespace PresentationLayer.Hubs;

public class AuctionHubService : IAuctionHubService
{
    private readonly IHubContext<AuctionHub> _hubContext;
    private readonly ILogger<AuctionHubService> _logger;

    public AuctionHubService(IHubContext<AuctionHub> hubContext, ILogger<AuctionHubService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastBidUpdateAsync(string auctionId, NewBidUpdateDto payload)
    {
        var groupName = $"Auction-{auctionId}";
        try
        {
            _logger.LogInformation("Broadcasting bid update to group {GroupName}", groupName);

            // sent data for client
            await _hubContext.Clients.Group(groupName)
                .SendAsync("ReceiveBidUpdate", payload); // "ReceiveBidUpdate" is name event for FE
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast SignalR update to group {GroupName}", groupName);
        }
    }
}