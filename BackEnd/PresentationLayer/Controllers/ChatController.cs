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
                var messages = await _chat.GetMessagesAsync(cid, limit);
                return Ok(messages);
        }

        [HttpGet("users/{userId}/rooms")]
        public async Task<IActionResult> GetRoomsForUser(long userId)
        {
            // **Lưu ý bảo mật:**
            // Thông thường, bạn nên lấy 'userId' từ Claims của user
            // đã xác thực (HttpContext.User) thay vì tin tưởng vào URL.
            // var authenticatedUserId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            // if (authenticatedUserId != userId)
            // {
            //     return Forbid(); // Hoặc Unauthorized
            // }

            var rooms = await _chat.GetRoomsByUserIdAsync(userId);

            // 'rooms' lúc này là IEnumerable<ChatRoomSummaryDto>
            return Ok(rooms);
        }
    }
}
