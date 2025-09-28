using Application.DTOs;
using Application.IServices;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[Route("api/auction")]
[ApiController]
public class AuctionController : ControllerBase
{
    private readonly IAuctionService _auctionService;

    public AuctionController(IAuctionService autionService)
    {
        _auctionService = autionService;
    }

    [HttpPost("{biddingId}/bid")]
    public async Task<IActionResult> PlaceBid(int biddingId, [FromBody] PlaceBidRequestDto request)
    {
        var result = await _auctionService.PlaceBidAsync(biddingId, request.UserId, request.BidAmount);
        if (result)
        {
            return Ok(new { message = "Bid placed successfully." });
        }
        return BadRequest(new { message = "Failed to place bid. Check bidding status, amount, and wallet balance." });
    }

    [HttpGet("{biddingId}/status")]
    public async Task<IActionResult> GetAuctionStatus(int biddingId)
    {
        var auctionStatus = await _auctionService.GetAuctionStatusAsync(biddingId);
        if (auctionStatus != null)
        {
            return Ok(auctionStatus);
        }
        return NotFound(new { message = "Bidding not found." });
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionRequest request)
    {
        var result = await _auctionService.CreateAuctionAsync(request);
        return Ok(result);
    }
}