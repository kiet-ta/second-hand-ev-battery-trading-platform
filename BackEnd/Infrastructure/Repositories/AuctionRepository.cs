using Application.DTOs.AuctionDtos;
using Application.IRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AuctionRepository : IAuctionRepository
{
    private readonly EvBatteryTradingContext _context;

    public AuctionRepository(EvBatteryTradingContext context) => _context = context;

    public async Task<Auction?> GetByIdAsync(int auctionId) =>
        await _context.Auctions.FindAsync(auctionId);

    public async Task<Auction?> GetByItemIdAsync(int itemId) =>
        await _context.Auctions.FirstOrDefaultAsync(a => a.ItemId == itemId);

    public async Task<IEnumerable<Auction>> GetActiveAuctionsAsync() =>
        await _context.Auctions.Where(a => a.Status == "ongoing").ToListAsync();

    public async Task<(IEnumerable<Auction> auctions, int total)> GetAuctionsWithPaginationAsync(int page, int pageSize, string? status = null)
    {
        var query = _context.Auctions.AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(a => a.Status == status);
        }

        var total = await query.CountAsync();
        var auctions = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (auctions, total);
    }

    public async Task<int> CreateAsync(Auction auction)
    {
        await _context.Auctions.AddAsync(auction);
        await _context.SaveChangesAsync();
        return auction.AuctionId;
    }

    public async Task UpdateCurrentPriceAsync(Auction auction)
    {
        auction.UpdatedAt = DateTime.Now;
        _context.Auctions.Update(auction);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateStatusAsync(Auction auction, string newStatus)
    {
        auction.Status = newStatus;
        auction.UpdatedAt = DateTime.Now;
        _context.Auctions.Update(auction);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateTotalBidsAsync(int auctionId)
    {
        var auction = await GetByIdAsync(auctionId);
        if (auction != null)
        {
            auction.TotalBids = await _context.Bids.CountAsync(b => b.AuctionId == auctionId);
            auction.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync()
      => await _context.Auctions
            .Where(a => a.Status == "upcoming")
            .ToListAsync();

    public async Task<List<AuctionDto>> GetAllAsync(int page, int pageSize)
    {
        var result = await (
            from auction in _context.Auctions
            join item in _context.Items on auction.ItemId equals item.ItemId
            join image in _context.ItemImages on item.ItemId equals image.ItemId into imageGroup
            from image in imageGroup.DefaultIfEmpty()
            select new AuctionDto
            {
                AuctionId = auction.AuctionId,
                ItemId = auction.ItemId,
                Title = item.Title,
                Type = item.ItemType,
                StartingPrice = auction.StartingPrice,
                CurrentPrice = auction.CurrentPrice,
                StartTime = auction.StartTime,
                EndTime = auction.EndTime,
                ImageUrl = image != null ? image.ImageUrl : null
            }
        )
        .OrderByDescending(a => a.StartTime)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
        return result;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Auctions.CountAsync();
    }
}