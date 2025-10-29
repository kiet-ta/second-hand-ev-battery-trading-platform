using Application.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Application.DTOs.SignalRDtos.ChatDto;

namespace PresentationLayer.Controllers
{
    [Route("api/chat")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chat;
        public ChatController(IChatService chat) => _chat = chat;

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new InvalidOperationException("User ID claim is missing or invalid in token.");
            }
            return userId;
        }

        [HttpPost("rooms")]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
        {
            var room = await _chat.EnsureRoomAsync(dto.Members);
            return CreatedAtAction(nameof(GetRoom), new { cid = room.Cid }, room);
        }

        [HttpGet("rooms/{cid}")]
        public async Task<IActionResult> GetRoom(long cid)
        {
            int userId = GetCurrentUserId();
            var r = await _chat.GetRoomAsync(cid);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpPost("rooms/{cid}/messages")]
        [Authorize]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            var userIdClaim = User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Token invalid claim user_id.");

            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("user_id in token invalid.");

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
            int userId = GetCurrentUserId();
            var messages = await _chat.GetMessagesAsync(cid, limit);
                return Ok(messages);
        }

        [HttpGet("rooms")]
        public async Task<IActionResult> GetMyRooms()
        {
            int userId = GetCurrentUserId();
            var rooms = await _chat.GetRoomsByUserIdAsync(userId);

            return Ok(rooms);
        }
    }
}
