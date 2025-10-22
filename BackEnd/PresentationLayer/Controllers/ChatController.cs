using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Application.DTOs.SignalRDtos.ChatDto;

namespace PresentationLayer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chat;
        public ChatController(IChatService chat) => _chat = chat;

        [HttpPost("rooms")]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
        {
            var room = await _chat.EnsureRoomAsync(dto.Members);
            return CreatedAtAction(nameof(GetRoom), new { cid = room.Cid }, room);
        }

        [HttpGet("rooms/{cid}")]
        public async Task<IActionResult> GetRoom(long cid)
        {
            var r = await _chat.GetRoomAsync(cid);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Text))
                return BadRequest("Message text cannot be empty.");

            Message msg = await _chat.SendMessageAsync(dto);
            return Ok(new
            {
                success = true,
                data = msg
            });
        }

        [HttpGet("rooms/{cid}/messages")]
        public async Task<IActionResult> GetMessages(long cid, [FromQuery] int limit = 50)
        {
            
                var messages = await _chat.GetMessagesAsync(cid, limit);
                return Ok(messages);
            
            
        }
    }
}
