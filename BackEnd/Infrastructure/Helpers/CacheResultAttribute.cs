namespace Infrastructure.Helpers
{
    using Application.IHelpers;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.Configuration;
    using System;
    using System.Text.Json;
    using System.Threading.Tasks;

    [AttributeUsage(AttributeTargets.Method)]
    public class CacheResultAttribute : Attribute, IAsyncActionFilter
    {
        private readonly int _durationSeconds;

        public CacheResultAttribute(int durationSeconds = 0)
        {
            _durationSeconds = durationSeconds;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var cache = context.HttpContext.RequestServices.GetService(typeof(IRedisCacheHelper)) as IRedisCacheHelper;
            var config = context.HttpContext.RequestServices.GetService(typeof(IConfiguration)) as IConfiguration;

            if (cache == null || config == null)
            {
                await next();
                return;
            }


            int defaultExpiryMinutes = config.GetValue<int>("Redis:DefaultExpiryMinutes", 10);
            int expiryMinutes = _durationSeconds > 0 ? _durationSeconds / 60 : defaultExpiryMinutes;


            var key = $"{context.HttpContext.Request.Path}_{string.Join("_", context.ActionArguments.Values)}";

            var cachedData = cache.GetObject<string>(key);
            if (cachedData != null)
            {
                context.Result = new ContentResult
                {
                    Content = cachedData,
                    ContentType = "application/json",
                    StatusCode = 200
                };
                Console.WriteLine($"[RedisCache] Cache hit for key: {key}");
                return;
            }

            var executedContext = await next();

            if (executedContext.Result is ObjectResult objectResult)
            {
                var json = JsonSerializer.Serialize(objectResult.Value);

                cache.SetObject(key, json, TimeSpan.FromMinutes(expiryMinutes));

                Console.WriteLine($"[RedisCache] Cache set for key: {key} ({expiryMinutes} min)");
            }
        }
    }
}
