using Application.IHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Helpers
{
    public class CacheResultAttribute : Attribute, IAsyncActionFilter
    {
        private readonly int _durationMinutes;

        public CacheResultAttribute(int durationMinutes = 0)
        {
            _durationMinutes = durationMinutes;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var cache = context.HttpContext.RequestServices.GetService(typeof(IRedisCacheHelper)) as IRedisCacheHelper;
            var config = context.HttpContext.RequestServices.GetService(typeof(IConfiguration)) as IConfiguration;
            if (cache == null || config == null) { await next(); return; }

            int defaultExpiryMinutes = config.GetValue<int>("Redis:DefaultExpiryMinutes", 10);
            TimeSpan expiry = TimeSpan.FromMinutes(_durationMinutes > 0 ? _durationMinutes : defaultExpiryMinutes);

            var path = context.HttpContext.Request.Path.ToString();
            var argsDic = context.ActionArguments.OrderBy(k => k.Key)
                              .ToDictionary(k => k.Key, v => v.Value);
            var argsJson = JsonSerializer.Serialize(argsDic);
            var key = $"{path}:{ComputeSha256Hash(argsJson)}";

            var cachedData = cache.GetObject<string>(key);
            if (cachedData != null)
            {
                context.Result = new ContentResult { Content = cachedData, ContentType = "application/json", StatusCode = 200 };
                return;
            }

            var executedContext = await next();

            if (executedContext.Result is ObjectResult objectResult)
            {
                cache.SetObject(key, objectResult.Value, expiry);
            }
        }

        private static string ComputeSha256Hash(string raw)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            return Convert.ToHexString(bytes);
        }
    }
}