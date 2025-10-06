using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;
using PresentationLayer.DTOs;

namespace PresentationLayer.Controllers;

[ApiController]
[Route("[controller]")]
public class PayOSController : ControllerBase
{
    private readonly PayOS _payOS;
    public PayOSController(PayOS payOS)
    {
        _payOS = payOS;
    }
    [HttpPost("create-payment-link")]
    public async Task<IActionResult> CreatePaymenLink([FromBody] CreatePaymentRequest request)
    {
        long orderCode = request.OrderCode;
        int amount = request.Amount;
        string description = request.Description;
        var items = request.Items.Select(i => new ItemData(i.Name, i.Quantity, i.Price)).ToList();
        string returnUrl = request.ReturnUrl;
        string cancelUrl = request.CancelUrl;

        var domain = "http://localhost:5173/";

        var paymentData = new PaymentData(
           orderCode: orderCode,
           amount: amount,
           description: description,
           items: items,
           cancelUrl: domain + "payment/fail",
           returnUrl: domain + "payment/success"
       );

        var result = await _payOS.createPaymentLink(paymentData);

        return Ok(new
        {
            result.checkoutUrl,
            result.orderCode,
            result.paymentLinkId
        });
    }
    [HttpGet("info/{orderCode:long}")]
    public async Task<IActionResult> GetPaymentInfo(long orderCode)
    {
        var info = await _payOS.getPaymentLinkInformation(orderCode);
        return Ok(info);
    }
    [HttpPost("cancel/{orderCode:long}")]
    public async Task<IActionResult>  CancelPaymentLink(long orderCode, [FromBody] CancelRequest cancel)
    {
        var info = await _payOS.cancelPaymentLink(orderCode, cancel.Reason);
        return Ok(info);
    }
}

