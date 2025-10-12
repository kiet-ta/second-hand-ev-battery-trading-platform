using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerDashboardController : ControllerBase
    {
        private readonly ISellerDashboardService _sellerDashboardService;

        public SellerDashboardController(ISellerDashboardService dashboardService)
        {
            _sellerDashboardService = dashboardService;
        }

        [HttpGet("{sellerId}")]
        public async Task<IActionResult> GetDashboard(int sellerId)
        {
            var result = await _sellerDashboardService.GetSellerDashboardAsync(sellerId);
            if (result == null)
                return NoContent(); // HTTP 204
            return Ok(result); // HTTP 200
        }
    }
}
