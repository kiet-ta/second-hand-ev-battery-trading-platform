using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AuctionDtos;

public class NewBidUpdateDto
{
    public int AuctionId { get; set; }
    public decimal NewCurrentPrice { get; set; }
    public int TotalBids { get; set; }
    public string BidderName { get; set; }
    public DateTime BidTime { get; set; }
}
