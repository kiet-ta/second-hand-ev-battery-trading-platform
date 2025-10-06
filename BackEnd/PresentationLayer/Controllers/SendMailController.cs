using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MailController : ControllerBase
    {
        private readonly IMailService _mailService;

        public MailController(IMailService mailService)
        {
            _mailService = mailService;
        }

        [HttpPost("welcome")]
        public async Task<IActionResult> SendWelcome([FromBody] WelcomeDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.To))
                return BadRequest(new { status = "error", message = "Missing required field: To." });

            try
            {
                await _mailService.SendWelcomeMailAsync(request, request.ActionUrl);
                return Ok(new { status = "success", message = "Welcome email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        [HttpPost("ban")]
        public async Task<IActionResult> SendBan([FromBody] BanDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { status = "error", message = "Missing required fields: To, Reason." });

            try
            {
                await _mailService.SendBanMailAsync(request, request.Reason, request.ActionUrl);
                return Ok(new { status = "success", message = "Ban email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        [HttpPost("purchase-success")]
        public async Task<IActionResult> SendPurchaseSuccess([FromBody] PurchaseSuccessDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.OrderId))
                return BadRequest(new { status = "error", message = "Missing required fields: To, OrderId." });

            try
            {
                await _mailService.SendPurchaseSuccessMailAsync(request, request.OrderId, request.ActionUrl);
                return Ok(new { status = "success", message = "Purchase success email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", message = ex.Message });
            }
        }

        [HttpPost("purchase-fail")]
        public async Task<IActionResult> SendPurchaseFail([FromBody] PurchaseFailedDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.OrderId) || string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { status = "error", message = "Missing required fields: To, OrderId, Reason." });

            try
            {
                await _mailService.SendPurchaseFailedMailAsync(request, request.OrderId, request.Reason, request.ActionUrl);
                return Ok(new { status = "success", message = "Purchase failed email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = ex.Message
                });
            }
        }
    }
}
