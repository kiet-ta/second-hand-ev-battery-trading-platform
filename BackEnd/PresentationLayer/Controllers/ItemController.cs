using Application.DTOs;
using Application.IServices;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly IItemService _service;

        public ItemController(IItemService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ItemDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.ItemId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ItemDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpGet("latest-evs")]
        public async Task<IActionResult> GetLatestEVs([FromQuery] int count = 4)
        {
            var result = await _service.GetLatestEVsAsync(count);
            return Ok(result);
        }

        [HttpGet("latest-batterys")]
        public async Task<IActionResult> GetLatestBatteries([FromQuery] int count = 4)
        {
            var result = await _service.GetLatestBatteriesAsync(count);
            return Ok(result);
        }

        /// <summary>
        /// Search items for seller dashboard.
        /// Query params: itemType, sellerName, minPrice, maxPrice, page, pageSize, sortBy, sortDir
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string itemType,
            [FromQuery] string title,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "UpdatedAt",
            [FromQuery] string sortDir = "desc")
        {
            var result = await _service.SearchItemsAsync(
                itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir);

            return Ok(result);
        }
    }
}
