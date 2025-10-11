using Application.DTOs;
using Application.IServices;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;
using PresentationLayer.DTOs;

namespace PresentationLayer.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IValidator<PaymentRequestDto> _validator;

    public PaymentController(IPaymentService paymentService, IValidator<PaymentRequestDto> validator)
    {
        _paymentService = paymentService;
        _validator = validator;
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
    public async Task<IActionResult> CancelPayment(long orderCode, [FromBody] CancelRequest cancel)
    {
        await _paymentService.CancelPaymentAsync(orderCode, cancel.Reason);
        return Ok();
    }
}