using Application.DTOs;
using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/address")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            int userId = int.Parse(User.FindFirst("user_id")?.Value ?? "0");

            var address = new Address
            {
                UserId = userId,
                RecipientName = dto.RecipientName,
                Phone = dto.Phone,
                Street = dto.Street,
                Ward = dto.Ward,
                WardCode = dto.WardCode,
                District = dto.District,
                DistrictCode = dto.DistrictCode,
                Province = dto.Province,
                ProvinceCode = dto.ProvinceCode,
                IsDefault = dto.IsDefault,
                CreatedAt = DateTime.Now,
                IsShopAddress = false,
                IsDeleted = false
            };

            await _addressService.AddAddressAsync(address, userId);

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
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressDto dto)
        {
            var existing = await _addressService.GetAddressByIdAsync(id);
            if (existing == null) return NotFound(new { Message = "Address does not exist" });

            existing.RecipientName = dto.RecipientName;
            existing.Phone = dto.Phone;
            existing.Street = dto.Street;
            existing.Ward = dto.Ward;
            existing.WardCode = dto.WardCode;
            existing.District = dto.District;
            existing.DistrictCode = dto.DistrictCode;
            existing.Province = dto.Province;
            existing.ProvinceCode = dto.ProvinceCode;
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
        [HttpGet("default")]
        public async Task<IActionResult> GetDefaultAddressByUserId([FromQuery] int userId)
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
