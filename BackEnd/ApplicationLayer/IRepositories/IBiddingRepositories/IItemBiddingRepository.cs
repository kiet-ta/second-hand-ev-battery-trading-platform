using Domain.Entities;

namespace Application.IRepositories.IBiddingRepositories
{
    public interface IItemBiddingRepository
    {
        Task<ItemBidding> GetByItemIdAsync(int itemId);

        Task<ItemBidding> GetByIdAsync(int biddingId);

        Task<IEnumerable<ItemBidding>> getActiveAutionsAsync();

        Task<int> CreateAsync(ItemBidding itemBidding);

        Task UpdateCurrentPriceAsync(ItemBidding bidding);

        Task UpdateStatusAsync(ItemBidding bidding, string newStatus);
    }
}