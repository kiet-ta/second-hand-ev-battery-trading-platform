namespace Application.DTOs;

public class PlaceBidResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public decimal? CurrentPrice { get; set; }
}