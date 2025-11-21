using Application.IHelpers;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Helpers
{
    public class RedisCacheHelper : IRedisCacheHelper
    {
        private readonly ConnectionMultiplexer _redis;
        private readonly IDatabase _db;
        private readonly int _defaultExpiryMinutes;

        public RedisCacheHelper(IConfiguration configuration)
        {
            var host = configuration["Redis:Host"];
            var port = configuration["Redis:Port"];
            _defaultExpiryMinutes = int.TryParse(configuration["Redis:DefaultExpiryMinutes"], out var m) ? m : 5;

            _redis = ConnectionMultiplexer.Connect($"{host}:{port}");
            _db = _redis.GetDatabase();
        }

        public void SetObject<T>(string key, T obj, TimeSpan? expiry = null)
        {
            var json = JsonSerializer.Serialize(obj);
            var bytes = Compress(Encoding.UTF8.GetBytes(json));
            _db.StringSet(key, bytes, expiry ?? TimeSpan.FromMinutes(_defaultExpiryMinutes));
        }

        public T? GetObject<T>(string key)
        {
            var bytes = _db.StringGet(key);
            if (bytes.IsNull) return default;
            var json = Encoding.UTF8.GetString(Decompress(bytes));
            return JsonSerializer.Deserialize<T>(json);
        }

        public bool RemoveKey(string key) => _db.KeyDelete(key);

        public bool Exists(string key) => _db.KeyExists(key);

        private static byte[] Compress(byte[] data)
        {
            using var ms = new MemoryStream();
            using (var gzip = new GZipStream(ms, CompressionLevel.Optimal))
            {
                gzip.Write(data, 0, data.Length);
            }
            return ms.ToArray();
        }

        private static byte[] Decompress(byte[] data)
        {
            using var ms = new MemoryStream(data);
            using var gzip = new GZipStream(ms, CompressionMode.Decompress);
            using var outStream = new MemoryStream();
            gzip.CopyTo(outStream);
            return outStream.ToArray();
        }
        public string? GetObjectDecoded(string key)
        {
            var bytes = _db.StringGet(key);
            if (bytes.IsNull) return null;

            using var ms = new MemoryStream(bytes);
            using var gzip = new GZipStream(ms, CompressionMode.Decompress);
            using var outStream = new MemoryStream();
            gzip.CopyTo(outStream);

            var json = Encoding.UTF8.GetString(outStream.ToArray());
            return json;
        }
        
    }
}
