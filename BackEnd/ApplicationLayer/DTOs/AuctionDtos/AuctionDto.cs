using Application.DTOs.ItemDtos;

namespace Application.DTOs.AuctionDtos;

public class AuctionDto
{
    public int AuctionId { get; set; }
    public int ItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal? CurrentPrice { get; set; }
    public int TotalBids { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public int StepPrice { get; set; } = 0;
    public List<ItemImageDto>? Images { get; set; } = new();
}