using Application.DTOs;
using Application.DTOs.PaymentDtos;
using Application.IServices;
using Application.Services;
using CloudinaryDotNet.Core;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;
using System.Security.Claims;
using System.Text.Json;

namespace PresentationLayer.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IValidator<PaymentRequestDto> _validator;
    public record Response(int error, string message, object? data);

    public PaymentController(IPaymentService paymentService, IValidator<PaymentRequestDto> validator, IUserService userService)
    {
        _paymentService = paymentService;
        _validator = validator;
    }

    [HttpGet]
    [Route("details/user/{userId}")]
    [ProducesResponseType(typeof(IEnumerable<UserPaymentDetailHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPaymentDetailsHistory(int userId)
    {
        if (userId <= 0)
        {
            return BadRequest("Invalid User ID.");
        }

        var paymentDetails = await _paymentService.GetUserPaymentDetailsHistoryAsync(userId);

        if (paymentDetails == null || !paymentDetails.Any())
        {
            return NotFound($"No payment details found for User ID: {userId}.");
        }

        return Ok(paymentDetails);
    }

    [HttpGet]
    [Route("with-details")]
    [ProducesResponseType(typeof(IEnumerable<PaymentWithDetailsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentsWithDetails()
    {
        var payments = await _paymentService.GetPaymentsDataAsync();

        return Ok(payments);
    }

    [HttpGet]
    [Route("history/user/{buyerId}")]
    [ProducesResponseType(typeof(IEnumerable<PaymentWithDetailsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentHistoryByRoles(int buyerId, int? sellerId = null, int? managerId = null)
    {
        // Kiểm tra điều kiện bắt buộc
        if (buyerId <= 0)
        {
            return BadRequest("BuyerId is required and must be valid.");
        }

        var payments = await _paymentService.GetPaymentHistoryByRolesAsync(buyerId, sellerId, managerId);

        if (payments == null || !payments.Any())
        {
            return NotFound("No payment history found matching the criteria.");
        }

        return Ok(payments);
    }

    [HttpGet]
    [Route("detail/buyer/{userId}/order/{orderId}")]
    [ProducesResponseType(typeof(DetailedPaymentHistoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransactionDetail(int userId, int orderId)
    {
        var detail = await _paymentService.GetTransactionDetailByOrder(userId, orderId);

        if (detail == null)
        {
            return NotFound($"Không tìm thấy giao dịch cho User ID {userId} và Order ID {orderId}.");
        }

        return Ok(detail);
    }

    [HttpPost("confirm-order/{orderId}")]
    public async Task<IActionResult> ConfirmOrder(int orderId)
    {
        try
        {
            var buyerIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(buyerIdString))
            {
                return Unauthorized("Token không hợp lệ.");
            }

            var buyerId = int.Parse(buyerIdString);

            var result = await _paymentService.ConfirmOrderAndSplitPaymentAsync(orderId, buyerId);

            if (result)
            {
                return Ok(new { message = "Xác nhận đơn hàng thành công. Tiền đã được chuyển." });
            }

            return BadRequest(new { message = "Xác nhận đơn hàng thất bại." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("webhook")]
    [Consumes("application/json", "text/plain", "application/x-www-form-urlencoded")]
    public async Task<IActionResult> HandleWebhook()
    {
        string rawBody;
        using (var reader = new StreamReader(Request.Body))
        {
            rawBody = await reader.ReadToEndAsync();
        }

        if (string.IsNullOrWhiteSpace(rawBody) || rawBody.StartsWith("'"))
        {
            Console.WriteLine("[Webhook] Received empty or invalid ping — ignore it.");
            return Ok(new { status = "ok" });
        }

        WebhookType? webhook = null;
        
            webhook = JsonSerializer.Deserialize<WebhookType>(rawBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
       

        if (webhook == null)
        {
            Console.WriteLine("[Webhook] Deserialized null, ignoring...");
            return Ok(new { status = "ok" });
        }

        
            await _paymentService.HandleWebhookAsync(webhook);
            Console.WriteLine("[Webhook] Processed successfully");
            return Ok(new { status = "ok" });
        
        
    }

    [HttpPost("create-payment-link")]
    public async Task<IActionResult> CreatePayment([FromBody] PaymentRequestDto request)
    {
        //var validationResult = await _validator.ValidateAsync(request);
        //if (!validationResult.IsValid)
        //    return BadRequest(validationResult.Errors);

        var response = await _paymentService.CreatePaymentAsync(request);
        return Ok(response);
    }

    [HttpGet("info/{orderCode:long}")]
    public async Task<IActionResult> GetPaymentInfo(long orderCode)
    {
        var info = await _paymentService.GetPaymentInfoAsync(orderCode);
        return Ok(info);
    }

    [HttpPost("cancel/{orderCode:long}")]
    public async Task<IActionResult> CancelPayment(long orderCode, [FromBody] PaymentCancelRequestDto cancel)
    {
        await _paymentService.CancelPaymentAsync(orderCode, cancel);
        return Ok();
    }

    [HttpPost("register-seller")]
    [Authorize]
    public async Task<IActionResult> CreateSellerRegistrationPayment([FromBody] SellerRegistrationPaymentRequestDto request)
    {
        var response = await _paymentService.CreateSellerRegistrationPaymentAsync(request);
        return Ok(response);
    }

    [HttpPost("initiate-deposit")]
    [Authorize]
    public async Task<IActionResult> InitiateWalletDeposit([FromBody] InitiateDepositRequestDto request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Deposit amount must be positive." });
        }

        var response = await _paymentService.CreateDepositPaymentLinkAsync(userId, request.Amount);
        return Ok(response);
    }


}
