using Application.IRepositories.IBiddingRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class BidRepository : IBidRepository
    {
        private readonly EvBatteryTradingContext _context;

        public BidRepository(EvBatteryTradingContext context) =>
            _context = context;

        public async Task<IEnumerable<Bid>> GetBidsByAuctionAsync(int auctionId) =>
            await _context.Bids.Where(b => b.AuctionId == auctionId).OrderByDescending(b => b.BidTime).ToListAsync();

        public async Task<Bid?> GetHighestBidAsync(int auctionId) =>
            await _context.Bids.Where(b => b.AuctionId == auctionId).OrderByDescending(b => b.BidAmount).FirstOrDefaultAsync();

        public async Task<int> PlaceBidAsync(Bid bid)
        {
            var entity = (await _context.Bids.AddAsync(bid)).Entity;
            await _context.SaveChangesAsync();
            return entity.BidId;
        }
    }
}