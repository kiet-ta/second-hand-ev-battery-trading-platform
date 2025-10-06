using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IBidRepository
{
    Task<IEnumerable<Bid>> GetBidsByAuctionAsync(int biddingId);

    Task<Bid> GetHighestBidAsync(int biddingId);

    Task<int> PlaceBidAsync(Bid bid);
}