using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.IServices;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly IItemService _service;
        private readonly IEVDetailService _evService;
        private readonly IBatteryDetailService _batteryService;

        public ItemController(IItemService service, IEVDetailService evService, IBatteryDetailService batteryService)
        {
            _service = service;
            _evService = evService;
            _batteryService = batteryService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllItem() => Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] ItemDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetItem), new { id = created.ItemId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] ItemDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
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
        public async Task<IActionResult> SearchItem(
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

        [HttpGet("with-detail/{id}")]
        public async Task<IActionResult> GetItemWithDetails(int id)
        {
            var item = await _service.GetItemWithDetailsAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetAllItemsWithDetails()
        {
            var items = await _service.GetAllItemsWithDetailsAsync();
            return Ok(items);
        }

        //[HttpGet("detail/ev")]
        //public async Task<IActionResult> GetAll(CancellationToken ct)
        //{
        //    var list = await _evService.GetAllAsync(ct);
        //    return Ok(list);
        //}

        //[HttpGet("detail/ev/{id:int}")]
        //public async Task<IActionResult> Get(int id, CancellationToken ct)
        //{
        //    var e = await _evService.GetByIdAsync(id, ct);
        //    if (e == null) return NotFound();
        //    return Ok(e);
        //}

        [HttpPost("detail")]
        public async Task<IActionResult> CreateEv([FromBody] CreateEvDetailDto dto, CancellationToken ct)
        {
            try
            {
                var created = await _evService.CreateAsync(dto, ct);
                return CreatedAtAction(nameof(GetItem), new { id = created.ItemId }, created);
            }
            catch (ArgumentException aex)
            {
                return BadRequest(aex.Message);
            }
            catch (InvalidOperationException dbEx)
            {
                return Conflict(dbEx.Message);
            }
        }

        [HttpPut("detail/{id:int}")]
        public async Task<IActionResult> UpdateEv(int id, [FromBody] UpdateEvDetailDto dto, CancellationToken ct)
        {
            var ok = await _evService.UpdateAsync(id, dto, ct);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("detail/{id:int}")]
        public async Task<IActionResult> DeleteEv(int id, CancellationToken ct)
        {
            var ok = await _evService.DeleteAsync(id, ct);
            if (!ok) return NotFound();
            return NoContent();
        }

        //[HttpGet("detail/battery")]
        //public async Task<IActionResult> GetAll()
        //{
        //    var result = await _service.GetAllAsync();
        //    return Ok(result);
        //}

        //[HttpGet("detail/{itemId}")]
        //public async Task<IActionResult> GetById(int itemId)
        //{
        //    var result = await _service.GetByIdAsync(itemId);
        //    if (result == null) return NotFound();
        //    return Ok(result);
        //}

        [HttpPost("detail/battery")]
        public async Task<IActionResult> CreateBattery(CreateBatteryDetailDto dto)
        {
            await _batteryService.CreateAsync(dto);
            return Ok();
        }

        [HttpPut("detail/battery/{itemId}")]
        public async Task<IActionResult> UpdateBattery(int itemId, UpdateBatteryDetailDto dto)
        {
            await _batteryService.UpdateAsync(itemId, dto);
            return Ok();
        }

        [HttpDelete("detail/battery/{itemId}")]
        public async Task<IActionResult> DeleteBattery(int itemId)
        {
            await _batteryService.DeleteAsync(itemId);
            return Ok();
        }
    }
}
