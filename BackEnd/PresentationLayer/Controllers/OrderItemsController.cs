using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/order-items")]
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderItem(int id, [FromBody] UpdateOrderItemDto dto)
        {
            var result = await _orderItemService.UpdateOrderItemAsync(id, dto);
            if (!result)
                return NotFound(new { message = "Order item not found or already deleted." });

            return Ok(new { message = "Order item updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var result = await _orderItemService.DeleteOrderItemAsync(id);
            if (!result)
                return NotFound(new { message = "Order item not found or already deleted." });

            return Ok(new { message = "Order item deleted successfully." });
        }

        [HttpPut("confirm-shipping/{orderItemId}")]

        public async Task<IActionResult> ConfirmShipping(int orderItemId)
        {
            var result = await _orderItemService.ConfirmShippingAsync(orderItemId);
            if (!result)
                return NotFound(new { message = "Order item not found or cannot confirm shipping." });
            return Ok(new { message = "Shipping confirmed successfully." });
        }
    }
}
