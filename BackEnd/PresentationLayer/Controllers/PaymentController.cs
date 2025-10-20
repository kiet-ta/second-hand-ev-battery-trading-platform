using Application.DTOs.PaymentDtos;
using Application.IServices;
using Application.Services;
using CloudinaryDotNet.Core;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;
using System.Text.Json;

namespace PresentationLayer.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IValidator<PaymentRequestDto> _validator;
    private readonly IUserService _userService;
    public record Response(int error, string message, object? data);

    public PaymentController(IPaymentService paymentService, IValidator<PaymentRequestDto> validator, IUserService userService)
    {
        _paymentService = paymentService;
        _validator = validator;
        _userService = userService;
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
        try
        {
            webhook = JsonSerializer.Deserialize<WebhookType>(rawBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Webhook] JSON parse error: {ex.Message}");
            return Ok(new { status = "ok" });
        }

        if (webhook == null)
        {
            Console.WriteLine("[Webhook] Deserialized null, ignoring...");
            return Ok(new { status = "ok" });
        }

        try
        {
            await _paymentService.HandleWebhookAsync(webhook);
            Console.WriteLine("[Webhook] Processed successfully");
            return Ok(new { status = "ok" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Webhook Error] {ex}");
            return Ok(new { status = "ok" });
        }
    }

    [HttpPost("create-payment-link")]
    public async Task<IActionResult> CreatePayment([FromBody] PaymentRequestDto request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        try
        {
            var response = await _paymentService.CreatePaymentAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            // Log ex
            return StatusCode(500, "Server error: " + ex.Message);
        }
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
        await _paymentService.CancelPaymentAsync(orderCode, cancel.Reason);
        return Ok();
    }

    [HttpPost("register-seller")]
    [Authorize]
    public async Task<IActionResult> CreateSellerRegistrationPayment([FromBody] SellerRegistrationPaymentRequestDto request)
    {
        try
        {
            // Check if the user is already a seller and has paid the fee
            var user = await _userService.GetUserByIdAsync(request.UserId);
            if (user.Role != "seller" || user.Paid == "registering" || user.Paid == "account-maintenance-fee")
            {
                return BadRequest(new { message = "User is not a seller or has paid the fee." });
            }

            var response = await _paymentService.CreateSellerRegistrationPaymentAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Server error: " + ex.Message);
        }
    }
}