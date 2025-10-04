using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class ItemBidding
{
    public int BiddingId { get; set; }

    public int ItemId { get; set; }

    public decimal StartingPrice { get; set; }

    public decimal CurrentPrice { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    //public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();

    //public virtual Item Item { get; set; } = null!;
}
