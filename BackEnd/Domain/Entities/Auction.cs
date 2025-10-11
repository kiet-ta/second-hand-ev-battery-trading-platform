using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Auction
{
    public int AuctionId { get; set; }

    public int ItemId { get; set; }

    public decimal StartingPrice { get; set; }

    public decimal CurrentPrice { get; set; }

    public int TotalBids { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

}
