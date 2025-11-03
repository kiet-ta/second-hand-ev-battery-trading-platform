using Application.IRepositories.IChatRepositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.Pkcs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.ChatRepositories
{
    public class FirebaseChatRepository : IChatRepository
    {
        private readonly HttpClient _http;
        private readonly FirebaseOptions _opts;

        public FirebaseChatRepository(HttpClient http, IOptions<FirebaseOptions> opts)
        {
            _http = http;
            _opts = opts.Value;
        }

        private string BasePath => $"{_opts.DatabaseUrl.TrimEnd('/')}/chat_rooms";

        // Thêm auth parameter vào mọi request
        private string NodeUrl(long cid) => $"{BasePath}/{cid}.json?auth={_opts.DatabaseSecret}";
        private string MessagesUrl(long cid) => $"{BasePath}/{cid}/messages.json?auth={_opts.DatabaseSecret}";
        private string AllRoomsUrl => $"{BasePath}.json?auth={_opts.DatabaseSecret}";
        private string AllRoomsPath() => $"{BasePath}.json?auth={_opts.DatabaseSecret}";

        public async Task<ChatRoom?> GetRoomRawAsync(long cid)
        {
            try
            {
                var resp = await _http.GetAsync(NodeUrl(cid));
                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine($"Firebase GET error: {resp.StatusCode} - {error}");
                    return null;
                }

                var json = await resp.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json) || json == "null") return null;

                var doc = JsonSerializer.Deserialize<JsonElement>(json);
                var room = new ChatRoom { Cid = cid };

                if (doc.TryGetProperty("members", out var membersElement))
                {
                    if (membersElement.ValueKind == JsonValueKind.Array)
                    {
                        room.Members = membersElement.EnumerateArray()
                            .Select(x => x.GetInt64())
                            .ToList();
                    }
                }

                return room;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetRoomRawAsync error: {ex.Message}");
                return null;
            }
        }

        public async Task SaveRoomRawAsync(ChatRoom room)
        {
            try
            {
                var payload = new
                {
                    cid = room.Cid,
                    members = room.Members
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                // Dùng PUT để tạo/replace node
                var resp = await _http.PutAsync(NodeUrl(room.Cid), content);

                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    throw new Exception($"Firebase PUT error: {resp.StatusCode} - {error}");
                }

                Console.WriteLine($"Room {room.Cid} saved successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SaveRoomRawAsync error: {ex.Message}");
                throw;
            }
        }

        public async Task AppendMessageAsync(long cid, Message message)
        {
            try
            {
                var payload = new
                {
                    id = message.Id,
                    from = message.From,
                    to = message.To,
                    text = message.Text,
                    createdAt = message.CreatedAt.ToString("o") // ISO 8601 format
                };

                var resp = await _http.PostAsJsonAsync(MessagesUrl(cid), payload);

                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    throw new Exception($"Firebase POST message error: {resp.StatusCode} - {error}");
                }

                var result = await resp.Content.ReadAsStringAsync();
                Console.WriteLine($"Message saved: {result}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AppendMessageAsync error: {ex.Message}");
                throw;
            }
        }

        public async Task<IEnumerable<Message>> GetMessagesAsync(long cid, int limit = 50)
        {
            try
            {
                var url = $"{BasePath}/{cid}/messages.json?auth={_opts.DatabaseSecret}";

                var resp = await _http.GetAsync(url);

                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine($"GetMessagesAsync error: {resp.StatusCode} - {error}");
                    return Array.Empty<Message>();
                }

                var json = await resp.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json) || json == "null")
                    return Array.Empty<Message>();

                var messagesDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
                if (messagesDict == null) return Array.Empty<Message>();

                var messages = new List<Message>();

                foreach (var kv in messagesDict)
                {
                    try
                    {
                        var msgData = kv.Value;

                        var message = new Message
                        {
                            Id = msgData.GetProperty("id").GetString() ?? "",
                            From = msgData.GetProperty("from").GetInt64(),
                            To = msgData.GetProperty("to").GetInt64(),
                            Text = msgData.GetProperty("text").GetString() ?? "",
                            CreatedAt = DateTimeOffset.Parse(msgData.GetProperty("createdAt").GetString() ?? DateTimeOffset.UtcNow.ToString("o"))
                        };

                        messages.Add(message);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing message {kv.Key}: {ex.Message}");
                    }
                }

                // Sắp xếp theo thời gian tăng dần
                return messages.OrderBy(m => m.CreatedAt).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetMessagesAsync error: {ex.Message}");
                return Array.Empty<Message>();
            }
        }

        public async Task<IEnumerable<ChatRoom>> QueryRoomsByMemberAsync(long memberId)
        {
            try
            {
                var resp = await _http.GetAsync(AllRoomsUrl);

                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine($"QueryRoomsByMemberAsync error: {resp.StatusCode} - {error}");
                    return Array.Empty<ChatRoom>();
                }

                var json = await resp.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json) || json == "null")
                    return Array.Empty<ChatRoom>();

                var map = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
                if (map == null) return Array.Empty<ChatRoom>();

                var result = new List<ChatRoom>();

                foreach (var kv in map)
                {
                    try
                    {
                        var roomData = kv.Value;
                        if (!roomData.TryGetProperty("cid", out var cidProp)) continue;
                        if (!roomData.TryGetProperty("members", out var membersProp)) continue;

                        var cid = cidProp.GetInt64();
                        var members = membersProp.EnumerateArray()
                            .Select(x => x.GetInt64())
                            .ToList();

                        if (members.Contains(memberId))
                        {
                            result.Add(new ChatRoom { Cid = cid, Members = members });
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing room {kv.Key}: {ex.Message}");
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"QueryRoomsByMemberAsync error: {ex.Message}");
                return Array.Empty<ChatRoom>();
            }
        }
        public async Task<IEnumerable<long>> GetRoomIdsByUserIdAsync(long userId)
        {
            string queryUrl = $"{AllRoomsPath()}&select=\"members\"";
            var matchingRoomIds = new List<long>();

            try
            {
                var resp = await _http.GetAsync(queryUrl);
                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine($"Firebase GET (All Rooms) error: {resp.StatusCode} - {error}");
                    return matchingRoomIds;
                }

                var json = await resp.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json) || json == "null")
                {
                    return matchingRoomIds;
                }

                var allRooms = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);

                if (allRooms == null) return matchingRoomIds;

                foreach (var roomPair in allRooms)
                {
                    string roomCidString = roomPair.Key;
                    JsonElement roomElement = roomPair.Value;

                    if (roomElement.TryGetProperty("members", out var membersElement) &&
                        membersElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var memberIdElement in membersElement.EnumerateArray())
                        {
                            if (memberIdElement.ValueKind == JsonValueKind.Number &&
                                memberIdElement.GetInt64() == userId)
                            {
                                if (long.TryParse(roomCidString, out long cid))
                                {
                                    matchingRoomIds.Add(cid);
                                }
                                break; 
                            }
                        }
                    }
                }

                return matchingRoomIds;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetRoomIdsByUserIdAsync (Firebase) error: {ex.Message}");
                return matchingRoomIds;
            }
        }

        public async Task<Message?> GetLastMessageAsync(long cid)
        {
            string baseUrl = MessagesUrl(cid);
            string orderByValue = Uri.EscapeDataString("\"createdAt\"");
            string queryUrl = $"{baseUrl}&orderBy={orderByValue}&limitToLast=1";

            try
            {
                var resp = await _http.GetAsync(queryUrl);
                if (!resp.IsSuccessStatusCode) return null;

                var json = await resp.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json) || json == "null") return null;

                var doc = JsonSerializer.Deserialize<JsonElement>(json);

                if (doc.ValueKind == JsonValueKind.Object)
                {
                    var firstProperty = doc.EnumerateObject().FirstOrDefault();
                    if (firstProperty.Value.ValueKind != JsonValueKind.Undefined)
                    {
                        return DeserializeMessage(firstProperty.Name, firstProperty.Value);
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetLastMessageAsync error: {ex.Message}");
                return null;
            }
        }

        private Message DeserializeMessage(string id, JsonElement element)
        {
            long timestampMs = 0;
            if (element.TryGetProperty("createdAt", out var tsEl) && tsEl.ValueKind == JsonValueKind.Number)
            {
                timestampMs = tsEl.GetInt64();
            }

            DateTimeOffset createdAt = DateTimeOffset.FromUnixTimeMilliseconds(timestampMs);

            return new Message
            {
                Id = id,
                From = element.TryGetProperty("from", out var fromEl) ? fromEl.GetInt64() : 0,
                To = element.TryGetProperty("to", out var toEl) ? toEl.GetInt64() : 0,
                Text = element.TryGetProperty("text", out var textEl) ? textEl.GetString() ?? "" : "",
                CreatedAt = createdAt
            };
        }
    }
}
