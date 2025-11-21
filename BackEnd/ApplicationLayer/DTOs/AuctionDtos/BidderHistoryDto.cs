using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AuctionDtos;

public class BidderHistoryDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public decimal BidAmount { get; set; }
    public DateTime? BidTime { get; set; }
}