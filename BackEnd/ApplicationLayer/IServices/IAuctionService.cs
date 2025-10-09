using Application.DTOs;
using Application.DTOs.AuctionDtos;

namespace Application.IServices;

public interface IAuctionService
{
    Task<AuctionListResponse> GetAuctionsAsync(int page = 1, int pageSize = 10, string? status = null);

    Task<AuctionDto?> GetAuctionByIdAsync(int auctionId);

    Task<CreateAuctionResponse> CreateAuctionAsync(CreateAuctionRequest request);

    Task<bool> PlaceBidAsync(int auctionId, int userId, decimal bidAmount);

    Task UpdateAuctionStatusesAsync();

    Task<AuctionStatusDto> GetAuctionStatusAsync(int auctionId);

    Task<AuctionListResponse> GetAllAuctionsAsync(int page, int pageSize);
}