using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IBidRepository
{
    Task<IEnumerable<Bid>> GetBidsByAuctionAsync(int auctionId);

    Task<Bid?> GetHighestBidAsync(int auctionId);

    Task<int> PlaceBidAsync(Bid bid);
}