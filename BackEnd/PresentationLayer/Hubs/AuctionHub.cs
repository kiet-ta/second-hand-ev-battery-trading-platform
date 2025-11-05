using Application.DTOs.AuctionDtos;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace PresentationLayer.Hubs;

[Authorize]
public class AuctionHub : Hub
{
    private readonly IAuctionService _auctionService;
    private readonly IUserContextService _userContextService;
    private readonly ILogger<AuctionHub> _logger;

    //private readonly AuctionService _auctionService;
    public AuctionHub(IAuctionService auctionService, IUserContextService userContextService, ILogger<AuctionHub> logger)
    {
        _auctionService = auctionService;
        _userContextService = userContextService;
        _logger = logger;
    }

    public async Task PlaceBid(int auctionId, decimal bidAmount)
    {
        int? userId = _userContextService.GetUserId();
        if (!userId.HasValue)
        {
            _logger.LogWarning("PlaceBid attempt without valid user context.");
            await Clients.Caller.SendAsync("BidFailed", "User not authenticated.");
            return;
        }

        try
        {
            _logger.LogInformation($"User {userId} is placing a bid of {bidAmount} on auction {auctionId}");

            // 1. call service and receive new bid DTO 
            BidderHistoryDto newBidData = await _auctionService.PlaceBidAsync(auctionId, userId.Value, bidAmount);

            // 2. get name group
            var groupName = $"Auction-{auctionId}";

            // 3. Broadcast DTO for ALL client in group
            //    use event name Frontend is getting: "ReceiveCurrentState"
            await Clients.Group(groupName).SendAsync("ReceiveCurrentState", newBidData);

            _logger.LogInformation($"Successfully broadcasted new bid for auction {auctionId} to group {groupName}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Bid failed for user {userId} on auction {auctionId}");
            // if error, only sent for current user bid
            await Clients.Caller.SendAsync("BidFailed", ex.Message);
        }
    }

    // client join auction room
    public async Task JoinAuctionGroup(string auctionId)
    {
        var groupName = $"Auction-{auctionId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Client {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);

        // Send current price to newly joined client
        //var currentAuctionState = _auctionService.GetAuctionState(auctionId);
        // await Clients.Caller.SendAsync("ReceiveCurrentState", currentAuctionState);
    }

    //  client out auction room
    public async Task LeaveAuctionGroup(string auctionId)
    {
        var groupName = $"Auction-{auctionId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("Client {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogWarning("Client {ConnectionId} disconnected.", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}