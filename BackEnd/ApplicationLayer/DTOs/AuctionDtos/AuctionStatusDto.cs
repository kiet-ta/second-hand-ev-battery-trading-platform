namespace Application.DTOs.AuctionDtos;

public class AuctionStatusDto
{
    public int AuctionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}