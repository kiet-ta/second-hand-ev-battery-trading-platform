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
        await _auctionService.PlaceBidAsync(auctionId, request.UserId, request.BidAmount);
        return Ok(new { message = "Bid placed successfully." });
    }

    [HttpGet("{auctionId}/status")]
    public async Task<IActionResult> GetAuctionStatus(int auctionId)
    {
        var auctionStatus = await _auctionService.GetAuctionStatusAsync(auctionId);
        return Ok(auctionStatus);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionRequest request)
    {
        var result = await _auctionService.CreateAuctionAsync(request);
        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetActionByUserId(int userId)
    {
        var auction = _auctionService.GetAuctionsByUserId(userId);
        return Ok(auction);
    }
}