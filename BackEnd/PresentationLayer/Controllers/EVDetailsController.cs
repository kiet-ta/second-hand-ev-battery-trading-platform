using Application.DTOs.ItemDtos;
using Application.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/ev-details")]
    [ApiController]
    public class EVDetailsController : ControllerBase
    {
        private readonly IEVDetailService _evService;

        public EVDetailsController(IEVDetailService evService)
        {
            _evService = evService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await _evService.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("latest-evs")]
        public async Task<IActionResult> GetLatestEVs([FromQuery] int count = 4)
        {
            var result = await _evService.GetLatestEVsAsync(count);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEv([FromBody] CreateEvDetailDto dto, CancellationToken ct)
        {

            var created = await _evService.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetItem), new { id = created.ItemId }, created);

        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateEv(int id, [FromBody] UpdateEvDetailDto dto, CancellationToken ct)
        {
            var ok = await _evService.UpdateAsync(id, dto, ct);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteEv(int id, CancellationToken ct)
        {
            var ok = await _evService.DeleteAsync(id, ct);
            if (!ok) return NotFound();
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchEvDetail([FromQuery] EVSearchRequestDto request)
        {
            var results = await _evService.SearchEvDetailAsync(request);
            return Ok(results);
        }
    }
}
