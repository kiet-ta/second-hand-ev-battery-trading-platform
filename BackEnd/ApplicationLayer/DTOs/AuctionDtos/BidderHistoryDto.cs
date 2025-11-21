using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.DTOs.AuctionDtos;

public class BidderHistoryDto
{
    [JsonPropertyName("userId")]
    public int UserId { get; set; }
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;
    [JsonPropertyName("bidAmount")]
    public decimal BidAmount { get; set; }
    [JsonPropertyName("bidTime")]
    public DateTime? BidTime { get; set; }
}