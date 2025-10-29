using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories;

public interface IBidRepository
{
    Task<IEnumerable<Bid>> GetBidsByAuctionIdAsync(int auctionId);

    Task<Bid?> GetHighestBidAsync(int auctionId);

    Task<int> PlaceBidAsync(Bid bid);
    Task<Bid?> GetUserHighestActiveBidAsync(int auctionId, int userId);
    Task<Bid?> GetHighestActiveBidAsync(int auctionId, int? excludeBidId = null);
    Task<bool> UpdateBidStatusAsync(int bidId, string status);
    Task<IEnumerable<Bid>> GetAllLoserActiveOrOutbidBidsAsync(int auctionId, int winnerId);
}