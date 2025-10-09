using Application.DTOs;
using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemsController : ControllerBase
    {
        private readonly IOrderItemService _orderItemService;

        public OrderItemsController(IOrderItemService orderItemService)
        {
            _orderItemService = orderItemService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrderItem([FromBody] CreateOrderItemRequest request)
        {
            if (request == null)
                return BadRequest("Invalid data.");

            var result = await _orderItemService.CreateOrderItemAsync(request);

            return CreatedAtAction(nameof(CreateOrderItem), new { id = result.OrderItemId }, result);
        }

        // GET api/orderitems/cart/{buyerId}
        [HttpGet("cart/{buyerId:int}")]
        public async Task<IActionResult> GetCartItems(int buyerId)
        {
            var result = await _orderItemService.GetCartItemsByBuyerIdAsync(buyerId);
            if (!result.Any()) return NotFound("No items found in cart.");
            return Ok(result);
        }
    }
}
