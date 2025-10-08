using Application.DTOs.AuctionDtos;
using Domain.Entities;

namespace Application.IRepositories;

public interface IAuctionRepository
{
    Task<Auction?> GetByIdAsync(int auctionId);

    Task<Auction?> GetByItemIdAsync(int itemId);

    Task<IEnumerable<Auction>> GetActiveAuctionsAsync();

    Task<(IEnumerable<Auction> auctions, int total)> GetAuctionsWithPaginationAsync(int page, int pageSize, string? status = null);

    Task<int> CreateAsync(Auction auction);

    Task UpdateCurrentPriceAsync(Auction auction);

    Task UpdateStatusAsync(Auction auction, string newStatus);

    Task UpdateTotalBidsAsync(int auctionId);

    Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync();

    Task<List<AuctionDto>> GetAllAsync(int page, int pageSize);

    Task<int> GetTotalCountAsync();
}