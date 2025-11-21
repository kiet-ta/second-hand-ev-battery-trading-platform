using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/battery-details")]
    [ApiController]
    public class BatteryDetailsController : ControllerBase
    {
        private readonly IBatteryDetailService _batteryService;

        public BatteryDetailsController(IBatteryDetailService batteryService)
        {
            _batteryService = batteryService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await _batteryService.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("latest-batteries")]
        public async Task<IActionResult> GetLatestBatteries([FromQuery] int count = 4)
        {
            var result = await _batteryService.GetLatestBatteriesAsync(count);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBattery([FromBody] CreateBatteryDetailDto dto)
        {
            var created = await _batteryService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetItem), new { id = created.ItemId }, created);

        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBattery(int id, [FromBody] UpdateBatteryDetailDto dto)
        {
            await _batteryService.UpdateAsync(id, dto);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBattery(int itemId)
        {
            await _batteryService.DeleteAsync(itemId);
            return Ok();
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchBetteriesDetail([FromQuery] BatterySearchRequestDto request)
        {
            var results = await _batteryService.SearchBatteryDetailAsync(request);
            return Ok(results);
        }
    }
}
