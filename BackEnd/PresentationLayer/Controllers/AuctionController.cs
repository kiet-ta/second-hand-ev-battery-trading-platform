using Application.DTOs;
using Application.DTOs.AuctionDtos;
using Application.IServices;
using Domain.Entities;
using Google.Apis.Upload;
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

    [HttpGet("{auctionId}/bidders")]
    public async Task<IActionResult> GetBidderHistory(int auctionId)
    {
        var bidderHistory = await _auctionService.GetBidderHistoryAsync(auctionId);
        return Ok(bidderHistory);
    }
    [HttpGet("item/{itemId}")]
    public async Task<IActionResult> GetAuctionByItemId(int itemId)
    {
        var auctionDto = await _auctionService.GetAuctionByItemIdAsync(itemId);
        if (auctionDto == null)
        {
            return NotFound(new { message = "No auction found for this item." });
        }
        return Ok(auctionDto);
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

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetActionByUserId(int userId)
    {
        var auction = await _auctionService.GetAuctionsByUserId(userId);
        if (auction == null)
        {
            return NotFound(new { message = "No auctions found for this user." });
        }
        return Ok(auction);
    }
}