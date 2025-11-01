namespace Application.IServices;

public interface IAuctionFinalizationService
{
    Task FinalizeAuctionAsync(int auctionId);
}