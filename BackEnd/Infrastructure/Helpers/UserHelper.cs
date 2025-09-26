using Application.IHelpers;
using Domain.DTO;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Repository
{
    public class UserHelper : IUserHelper

    {
        private readonly IDatabase _redisDb;

        public UserHelper(IConnectionMultiplexer redis)
        {
            _redisDb = redis.GetDatabase();
        }

        public string GenerateCacheKey(UserFilterParams filter, int limit, int offset)
        {
            return $"users:role={filter.Role ?? "all"}:status={filter.AccountStatus ?? "all"}:keyword={filter.Keyword ?? "all"}:offset={offset}:limit={limit}";
        }
        public IQueryable<ExternalUser> ApplyFilters(IQueryable<ExternalUser> query, UserFilterParams filter)
        {
            if (!string.IsNullOrEmpty(filter.Role))
                query = query.Where(u => u.Role == filter.Role);

            if (!string.IsNullOrEmpty(filter.AccountStatus))
                query = query.Where(u => u.Status == filter.AccountStatus);

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                var keyword = filter.Keyword.ToLower();
                query = query.Where(u => u.Name.ToLower().Contains(keyword) || u.Email.ToLower().Contains(keyword));
            }

            return query;
        }
        public async Task ClearUsersCacheAsync()
        {
            var server = _redisDb.Multiplexer.GetServer(_redisDb.Multiplexer.GetEndPoints().First());
            foreach (var key in server.Keys(pattern: "users:*"))
            {
                await _redisDb.KeyDeleteAsync(key);
            }
        }

        public async Task<string?> GetStringAsync(string key)
        {
            return await _redisDb.StringGetAsync(key);
        }

        public async Task SetStringAsync(string key, string value, TimeSpan? expiry = null)
        {
            await _redisDb.StringSetAsync(key, value, expiry);
        }
        public async Task<T?> GetJsonAsync<T>(string key)
        {
            var value = await _redisDb.StringGetAsync(key);
            if (value.IsNullOrEmpty) return default;

            try
            {
                return JsonSerializer.Deserialize<T>(value);
            }
            catch
            {
                return default;
            }
        }
        public string SerializeToJson<T>(T obj)
        {
            return JsonSerializer.Serialize(obj);
        }



    }




}
