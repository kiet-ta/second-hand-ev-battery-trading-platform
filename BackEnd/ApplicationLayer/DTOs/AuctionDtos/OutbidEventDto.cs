namespace Application.DTOs.AuctionDtos;

public class OutbidEventDto
{
    public int AuctionId { get; set; }
    public int OutbidUserId { get; set; } // The person who was just outbid
    public decimal AmountToRelease { get; set; }
    public int? OriginalBidId { get; set; } // bid that was outbid
}