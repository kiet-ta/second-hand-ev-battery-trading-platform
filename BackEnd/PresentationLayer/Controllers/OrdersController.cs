using Application.DTOs;
using Application.DTOs.ItemDtos;
using Application.IServices;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("user/{userId}")] //RESTful
        public async Task<IActionResult> GetOrdersByUser(int userId)
        {
            var result = await _orderService.GetOrdersByUserIdAsync(userId);

            if (result == null || !result.Any())
                return NotFound(new { Message = "No orders found for this user" });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto dto)
        {
            var id = await _orderService.CreateOrderAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto)
        {
            dto.OrderId = id;
            var result = await _orderService.UpdateOrderAsync(dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _orderService.DeleteOrderAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPost("new")] //RESTful
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequestDto request)
        {
            var result = await _orderService.CreateOrderAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}/confirm-shipping")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> ConfirmShipping(int id)
        {
            var sellerId = 0; // TODO: Lấy sellerId từ JWT
            await _orderService.ConfirmOrderShippingAsync(id, sellerId);
            return Ok(new { Message = "Order status updated to Shipped." });
        }

        [HttpPut("{id}/confirm-delivery")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> ConfirmDelivery(int id)
        {
            var buyerId = 0; // TODO: Lấy buyerId từ JWT
            await _orderService.ConfirmOrderDeliveryAsync(id, buyerId);
            return Ok(new { Message = "Order completed and funds released to seller." });
        }
    }
}
