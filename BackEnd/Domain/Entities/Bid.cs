using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Bid
{
    public int BidId { get; set; }

    public int BiddingId { get; set; }

    public int UserId { get; set; }

    public decimal BidAmount { get; set; }

    public DateTime? BidTime { get; set; }

    //public virtual ItemBidding Bidding { get; set; } = null!;

    //public virtual User User { get; set; } = null!;
}
