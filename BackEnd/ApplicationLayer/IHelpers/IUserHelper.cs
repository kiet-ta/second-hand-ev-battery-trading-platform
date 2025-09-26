using Domain.DTO;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.IHelpers
{
    public interface IUserHelper
    {
        string GenerateCacheKey(UserFilterParams filter, int limit, int offset);
        Task ClearUsersCacheAsync();

       Task<string?> GetStringAsync(string key);

        Task SetStringAsync(string key, string value, TimeSpan? expiry = null);
        string SerializeToJson<T>(T obj);
        Task<T?> GetJsonAsync<T>(string key);
        IQueryable<ExternalUser> ApplyFilters(IQueryable<ExternalUser> query, UserFilterParams filter);

    }
}
