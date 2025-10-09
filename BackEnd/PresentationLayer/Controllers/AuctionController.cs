using Application.DTOs;
using Application.DTOs.AuctionDtos;
using Application.IServices;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[Route("api/auction")]
[ApiController]
public class AuctionController : ControllerBase
{
    private readonly IAuctionService _auctionService;

    public AuctionController(IAuctionService auctionService)
    {
        _auctionService = auctionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAuction([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var response = await _auctionService.GetAllAuctionsAsync(page, pageSize);
        return Ok(response);
    }

    [HttpPost("{auctionId}/bid")]
    public async Task<IActionResult> PlaceBid(int auctionId, [FromBody] PlaceBidRequestDto request)
    {
        var result = await _auctionService.PlaceBidAsync(auctionId, request.UserId, request.BidAmount);
        if (result)
        {
            return Ok(new { message = "Bid placed successfully." });
        }
        return BadRequest(new { message = "Failed to place bid. Check bidding status, amount, and wallet balance." });
    }

    [HttpGet("{auctionId}/status")]
    public async Task<IActionResult> GetAuctionStatus(int auctionId)
    {
        var auctionStatus = await _auctionService.GetAuctionStatusAsync(auctionId);
        if (auctionStatus != null)
        {
            return Ok(auctionStatus);
        }
        return NotFound(new { message = "Bidding not found." });
    }

    [HttpPost]
    public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionRequest request)
    {
        var result = await _auctionService.CreateAuctionAsync(request);
        return Ok(result);
    }
}