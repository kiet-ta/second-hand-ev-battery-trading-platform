namespace Application.DTOs;

public class CreateAuctionResponse
{
    public int BiddingId { get; set; }
    public int ItemId { get; set; }
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Status { get; set; }
}