using Application.IRepositories.IBiddingRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BidRepository : IBidRepository
{
    private readonly EvBatteryTradingContext _context;

    public BidRepository(EvBatteryTradingContext context) =>
        _context = context;

    public async Task<IEnumerable<Bid>> GetBidsByAuctionIdAsync(int auctionId) =>
        await _context.Bids.Where(b => b.AuctionId == auctionId).OrderByDescending(b => b.BidTime).ToListAsync();

    public async Task<Bid?> GetHighestBidAsync(int auctionId) =>
        await _context.Bids.Where(b => b.AuctionId == auctionId)
        .OrderByDescending(b => b.BidAmount)
        .ThenBy(b => b.BidTime) // prioritize earlier bids in case of tie
        .FirstOrDefaultAsync();

    public async Task<int> PlaceBidAsync(Bid bid)
    {
        var entity = (await _context.Bids.AddAsync(bid)).Entity;
        await _context.SaveChangesAsync();
        return entity.BidId;
    }
public async Task<Bid?> GetUserHighestActiveBidAsync(int auctionId, int userId)
    {
        return await _context.Bids
            .Where(b => b.AuctionId == auctionId && b.UserId == userId && b.Status == "active")
            .OrderByDescending(b => b.BidAmount)
            .ThenBy(b => b.BidTime)
            .FirstOrDefaultAsync();
    }

    public async Task<Bid?> GetHighestActiveBidAsync(int auctionId, int? excludeBidId = null)
    {
        var query = _context.Bids
            .Where(b => b.AuctionId == auctionId && b.Status == "active");

        if (excludeBidId.HasValue)
        {
            query = query.Where(b => b.BidId != excludeBidId.Value);
        }

        return await query
            .OrderByDescending(b => b.BidAmount)
            .ThenBy(b => b.BidTime)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateBidStatusAsync(int bidId, string status)
    {
        var bid = await _context.Bids.FindAsync(bidId);
        if (bid == null)
        {
            return false;
        }

        bid.Status = status;
        _context.Bids.Update(bid);

        return true;
    }
    public async Task<IEnumerable<Bid>> GetAllLoserActiveOrOutbidBidsAsync(int auctionId, int winnerId)
    {
        // get all bid was 'outbid' and 'active' to released to the loser
        var loserBids = await _context.Bids
                .Where(b => b.AuctionId == auctionId
                            && b.UserId != winnerId
                            && (b.Status == "active" || b.Status == "outbid")) 
                .ToListAsync();

        return loserBids;
    }
}