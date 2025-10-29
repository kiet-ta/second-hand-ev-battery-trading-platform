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
    public decimal StepPrice { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
