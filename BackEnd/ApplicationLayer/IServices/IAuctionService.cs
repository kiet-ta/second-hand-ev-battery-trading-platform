using Application.DTOs;

namespace Application.IServices
{
    public interface IAuctionService
    {
        Task<bool> PlaceBidAsync(int biddingId, int userId, decimal bidAmount);

        Task<ItemBiddingDto> GetAuctionStatusAsync(int biddingId);

        Task<CreateAuctionResponse> CreateAuctionAsync(CreateAuctionRequest request);
    }
}