using Application.DTOs;
using Application.DTOs.WalletDtos;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers;

[Route("api/wallet")]
[ApiController]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetWallet(int userId)
    {
        var wallet = await _walletService.GetWalletByUserIdAsync(userId);
        if (wallet == null)
        {
            return NotFound(new { message = "Wallet not found." });
        }
        return Ok(wallet);
    }

    [HttpGet("{walletId:int}/transactions")]
    public async Task<IActionResult> GetTransactions(int walletId)
    {
        var transactions = await _walletService.GetTransactionsByWalletIdAsync(walletId);
        return Ok(transactions);
    }

    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit([FromBody] DepositRequestDto request)
    {
        if (request == null || request.Amount <= 0)
        {
            return BadRequest(new { message = "Invalid deposit information." });
        }

        
            var success = await _walletService.DepositAsync(request.UserId, request.Amount);
            if (success)
            {
                return Ok(new { message = "Deposit successful." });
            }
            return StatusCode(500, new { message = "An error occurred while depositing money." });
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw([FromBody] WithdrawRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var transactionResult = await _walletService.WithdrawAsync(request);
        return Ok(new { message = $"{request.Type} successful.", transaction = transactionResult });
    }
}