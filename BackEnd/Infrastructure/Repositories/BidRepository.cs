using Application.IRepositories.IBiddingRepositories;
using Domain.Common.Constants;
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
            .Where(b => b.AuctionId == auctionId && b.UserId == userId && b.Status == BidStatus.Active.ToString())
            .OrderByDescending(b => b.BidAmount)
            .ThenBy(b => b.BidTime)
            .FirstOrDefaultAsync();
    }

    public async Task<Bid?> GetHighestActiveBidAsync(int auctionId, int? excludeBidId = null)
    {
        var query = _context.Bids
            .Where(b => b.AuctionId == auctionId && b.Status == BidStatus.Active.ToString());

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
        // Lấy bid cao nhất (đang active hoặc đã outbid) của mỗi người thua cuộc
        var loserLatestBids = await _context.Bids
            .Where(b => b.AuctionId == auctionId
                        && b.UserId != winnerId
                        && (b.Status == BidStatus.Active.ToString() || b.Status == BidStatus.OutBid.ToString())) // Chỉ lấy bid chưa released/cancelled
            .GroupBy(b => b.UserId)
            .Select(g => g.OrderByDescending(b => b.BidAmount).ThenBy(b => b.BidTime).First()) // Lấy bid mới nhất (cao nhất) của mỗi user thua
            .ToListAsync();

        return loserLatestBids;
    }
}