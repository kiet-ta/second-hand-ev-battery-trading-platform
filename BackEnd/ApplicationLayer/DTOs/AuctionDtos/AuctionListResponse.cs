namespace Application.DTOs.AuctionDtos;

public class AuctionListResponse
{
    public string Status { get; set; } = "success";
    public List<AuctionDto> Data { get; set; } = new();
    public AuctionMeta Meta { get; set; } = new();
}

public class AuctionMeta
{
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}