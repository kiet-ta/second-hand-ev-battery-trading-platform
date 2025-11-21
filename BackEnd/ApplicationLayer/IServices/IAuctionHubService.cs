using Application.DTOs.AuctionDtos;

namespace Application.IServices;

public interface IAuctionHubService
{
    Task BroadcastBidUpdateAsync(string auctionId, NewBidUpdateDto payload);
}