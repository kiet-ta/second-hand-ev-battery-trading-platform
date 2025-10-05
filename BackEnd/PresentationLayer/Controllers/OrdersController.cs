using Application.DTOs.ItemDtos;
using Application.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _service;

        public OrdersController(IOrderService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var order = await _service.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _service.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto dto)
        {
            var id = await _service.CreateOrderAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto)
        {
            dto.OrderId = id;
            var result = await _service.UpdateOrderAsync(dto);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteOrderAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
