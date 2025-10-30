using Application.IRepositories.IChatRepositories;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Repositories.ChatRepositories
{
    public class FirebaseUserModerationRepository : IUserModerationRepository
    {
        private readonly HttpClient _http;
        private readonly FirebaseOptions _opts; // Giả sử bạn có class FirebaseOptions

        public FirebaseUserModerationRepository(HttpClient http, IOptions<FirebaseOptions> opts)
        {
            _http = http;
            _opts = opts.Value;
        }

        private string BasePath => $"{_opts.DatabaseUrl.TrimEnd('/')}/user_moderation";

        // URL đến node chứa các log vi phạm của một user
        private string LogsUrl(long userId) => $"{BasePath}/{userId}/profanity_logs.json?auth={_opts.DatabaseSecret}";

        /// <summary>
        /// Thêm một mốc thời gian (Unix Milliseconds) vào danh sách
        /// </summary>
        public async Task AddProfanityLogAsync(long userId, DateTimeOffset timestamp)
        {
            try
            {
                long unixTimeMs = timestamp.ToUnixTimeMilliseconds();

                // POST một giá trị (long) sẽ tạo ra một key duy nhất (push ID)
                // và lưu timestamp làm value của nó.
                var resp = await _http.PostAsJsonAsync(LogsUrl(userId), unixTimeMs);

                if (!resp.IsSuccessStatusCode)
                {
                    var error = await resp.Content.ReadAsStringAsync();
                    Console.WriteLine($"Firebase POST (ProfanityLog) error: {resp.StatusCode} - {error}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AddProfanityLogAsync error: {ex.Message}");
            }
        }

        /// <summary>
        /// Đếm số lượng log trong cửa sổ thời gian (vd: 1 giờ qua) và dọn dẹp log cũ
        /// </summary>
        public async Task<int> GetProfanityCountAsync(long userId, TimeSpan timeWindow)
        {
            var cutoff = DateTimeOffset.UtcNow.Subtract(timeWindow).ToUnixTimeMilliseconds();
            var keysToDelete = new Dictionary<string, object?>();
            int recentCount = 0;

            try
            {
                var resp = await _http.GetAsync(LogsUrl(userId));
                if (!resp.IsSuccessStatusCode) return 0;

                var json = await resp.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json) || json == "null") return 0;

                // Dữ liệu trả về có dạng: { "firebase_push_id_1": 1678886400000, "firebase_push_id_2": 1678886500000 }
                var logs = JsonSerializer.Deserialize<Dictionary<string, long>>(json);
                if (logs == null) return 0;

                foreach (var kv in logs)
                {
                    if (kv.Value < cutoff)
                    {
                        // Nếu timestamp quá cũ, thêm vào danh sách để xóa
                        keysToDelete.Add(kv.Key, null); // Đặt giá trị là null để xóa
                    }
                    else
                    {
                        // Nếu timestamp nằm trong cửa sổ, đếm nó
                        recentCount++;
                    }
                }

                // Dọn dẹp các log cũ (fire-and-forget)
                if (keysToDelete.Any())
                {
                    // Dùng PATCH với payload { "key_to_delete": null } để xóa
                    _ = CleanupOldLogsAsync(userId, keysToDelete);
                }

                return recentCount;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetProfanityCountAsync error: {ex.Message}");
                return 0;
            }
        }

        private async Task CleanupOldLogsAsync(long userId, Dictionary<string, object?> keysToDelete)
        {
            try
            {
                var url = LogsUrl(userId);
                var content = new StringContent(JsonSerializer.Serialize(keysToDelete), Encoding.UTF8, "application/json");
                var req = new HttpRequestMessage(HttpMethod.Patch, url) { Content = content };

                var resp = await _http.SendAsync(req);
                if (!resp.IsSuccessStatusCode)
                {
                    Console.WriteLine("Failed to cleanup old profanity logs.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CleanupOldLogsAsync error: {ex.Message}");
            }
        }
    }
}
