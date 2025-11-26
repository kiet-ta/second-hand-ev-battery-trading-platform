using Application.DTOs;
using Application.DTOs.AuctionDtos;
using Application.IServices;
using Domain.Entities;
using Google.Apis.Upload;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PresentationLayer.Controllers;

[Route("api/auction")]
[ApiController]
public class AuctionController : ControllerBase
{
    private readonly IAuctionService _auctionService;
    private readonly IUserContextService _userContextService;
    public AuctionController(IAuctionService auctionService, IUserContextService userContextService)
    {
        _auctionService = auctionService;
        _userContextService = userContextService;
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

    [Authorize]
    [HttpPost("{auctionId}/bid")]
    public async Task<IActionResult> PlaceBid(int auctionId, [FromBody] PlaceBidRequestDto request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized(new { message = "User ID not found in token." });
        }
        if (!int.TryParse(userIdString, out int authenticatedUserId))
        {
            return BadRequest(new { message = "Invalid User ID format in token." });
        }
        await _auctionService.PlaceBidAsync(auctionId, authenticatedUserId, request.BidAmount);
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
    [HttpPost("{id}/buy-now")]
    [Authorize]
    public async Task<IActionResult> BuyNow(int id)
    {
        var userId = _userContextService.GetCurrentUserId();

        // If Auction has expired/Seller buys by himself -> Service throws InvalidOperationException -> Middleware returns 400
        await _auctionService.BuyNowAuctionAsync(id, int.Parse(userId.ToString()));

        return Ok(new
        {
            Status = "success",
            Message = "Giao dịch thành công! Bạn đã chiến thắng phiên đấu giá.",
            AuctionId = id
        });
    }
}