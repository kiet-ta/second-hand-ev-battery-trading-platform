namespace Domain.Entities;

public class Auction
{
    public int AuctionId { get; set; }

    public int ItemId { get; set; }

    public decimal StartingPrice { get; set; }

    public decimal? CurrentPrice { get; set; }

    public int TotalBids { get; set; } = 0;

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string Status { get; set; } = String.Empty; // upcoming, ongoing, ended, cancelled
    public int StepPrice { get; set; } = 0;
    
    /// <summary>
    /// Buy Now price - if a bid reaches this amount, auction ends immediately and bidder wins
    /// </summary>
    public decimal? BuyNowPrice { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
