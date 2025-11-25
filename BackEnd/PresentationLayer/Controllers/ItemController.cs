using Application.DTOs.ItemDtos;
using Application.DTOs.ItemDtos.BatteryDto;
using Application.IRepositories;
using Application.IServices;
using Application.Services;
using Infrastructure.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [Route("api/item")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly IItemService _service;
        private readonly IItemImageService _itemImageService;

        public ItemController(IItemService service, IItemImageService itemImageService)
        {
            _service = service;
            _itemImageService = itemImageService;
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

        [HttpGet("{itemId}/images")]
        public async Task<IActionResult> GetItemImages([FromServices] IItemImageRepository repo, int itemId)
        {
            var images = await repo.GetByItemIdAsync(itemId);
            return Ok(images);
        }

        [HttpPost("{itemId}/images")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadItemImageRequest request)
        {
            var urls = await _itemImageService.UploadItemImagesAsync(request.ItemId, request.Files);
            return Ok(new { Message = "Upload success", ImageUrls = urls });
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

        /// <summary>
        /// Search items for seller dashboard.
        /// Query params: itemType, sellerName, minPrice, maxPrice, page, pageSize, sortBy, sortDir
        /// </summary>
        [HttpGet("search")]
        //[CacheResult(600)]
        public async Task<IActionResult> SearchItem(
            [FromQuery] string itemType = "all",
            [FromQuery] string title = "",
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string sortBy = "UpdatedAt",
            [FromQuery] string sortDir = "desc")
        {
            var result = await _service.SearchItemsAsync(
            itemType, title, minPrice, maxPrice, page, pageSize, sortBy, sortDir);

            if (result.Items == null || !result.Items.Any())
                return NotFound(new { message = "No items found." });

            return Ok(result);
        }

        [HttpGet("with-detail/{itemId}")]
        public async Task<IActionResult> GetItemWithDetails(int itemId)
        {
            var item = await _service.GetItemWithDetailsAsync(itemId);
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpGet("with-detail/{itemId}/{orderId}")]
        public async Task<IActionResult> GetItemWithDetails(int itemId, int buyerId, int orderId)
        {
            var item = await _service.GetItemWithDetailsAsync(itemId, buyerId, orderId);
            if (item == null)
                return NotFound();

            return Ok(item);
        }

        [HttpGet("detail/all")]
        public async Task<IActionResult> GetAllItemsWithDetails()
        {
            var items = await _service.GetAllItemsWithDetailsAsync();
            return Ok(items);
        }





        [HttpGet("{itemId:int}/Seller")]
        public async Task<IActionResult> GetItemDetail(int itemId)
        {
            var item = await _service.GetItemDetailByIdAsync(itemId);

            if (item == null)
                return NotFound(new { message = "Item not found or has been deleted." });

            return Ok(item);
        }
        [HttpPut("{itemId}/approve")]
        public async Task<IActionResult> ApproveItem(int itemId)
        {

            var result = await _service.SetApprovedItemTagAsync(itemId);
            if (!result)
                return BadRequest("Item not found or not in 'pending' state.");

            return Ok(new { message = "Item approved successfully." });

        }

        [HttpPut("{itemId}/reject")]
        public async Task<IActionResult> RejectItem(int itemId)
        {

            var result = await _service.SetRejectedItemTagAsync(itemId);
            if (!result)
                return BadRequest("Item not found or not in 'pending' state.");

            return Ok(new { message = "Item rejected successfully." });

        }
    }
}