using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var address = new Address
            {
                UserId = dto.UserId,
                RecipientName = dto.RecipientName,
                Phone = dto.Phone,
                Street = dto.Street,
                Ward = dto.Ward,
                District = dto.District,
                Province = dto.Province,
                IsDefault = dto.IsDefault,
                CreatedAt = DateTime.Now,
                IsDeleted = false
            };

            await _addressService.AddAddressAsync(address);

            return CreatedAtAction(nameof(GetAddressById), new { id = address.AddressId }, address);
        }


        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAddressesByUserId(int userId)
        {
            var addresses = await _addressService.GetAddressesByUserIdAsync(userId);
            return Ok(addresses);
        }

 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressById(int id)
        {
            var address = await _addressService.GetAddressByIdAsync(id);
            if (address == null) return NotFound(new { Message = "Address does not exist" });

            return Ok(address);
        }

 
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressDTO dto)
        {
            var existing = await _addressService.GetAddressByIdAsync(id);
            if (existing == null) return NotFound(new { Message = "Address does not exist" });

            existing.RecipientName = dto.RecipientName;
            existing.Phone = dto.Phone;
            existing.Street = dto.Street;
            existing.Ward = dto.Ward;
            existing.District = dto.District;
            existing.Province = dto.Province;
            existing.IsDefault = dto.IsDefault;

            await _addressService.UpdateAddressAsync(existing);

            return Ok(existing);
        }

 
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            try
            {
                await _addressService.DeleteAddressAsync(id);
                return Ok(new { Message = "Delete Successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { ex.Message });
            }
        }
        [HttpGet("user/{userId}/default")]
        public async Task<IActionResult> GetDefaultAddressByUserId(int userId)
        {
            var address = await _addressService.GetAddressDefaultByUserId(userId);
            return Ok(address);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAddresses()
        {
            var addresses = await _addressService.GetAllAddressesAsync();
            return Ok(addresses);
        }
    }
}
