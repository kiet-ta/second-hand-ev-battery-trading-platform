namespace Infrastructure.Helpers
{
    using Application.IHelpers;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Filters;
    using System;
    using System.Text.Json;
    using System.Threading.Tasks;

    [AttributeUsage(AttributeTargets.Method)]
    public class CacheResultAttribute : Attribute, IAsyncActionFilter
    {
        private readonly int _durationSeconds;

        public CacheResultAttribute(int durationSeconds = 600) 
        {
            _durationSeconds = durationSeconds;
        }
        
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var cache = context.HttpContext.RequestServices.GetService(typeof(IRedisCacheHelper)) as IRedisCacheHelper;
            if (cache == null)
            {
                await next();
                return;
            }
            
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
                Console.WriteLine($"Cache hit for key: {key}");
                return;
            }

            var executedContext = await next();

            if (executedContext.Result is ObjectResult objectResult)
            {
                var json = JsonSerializer.Serialize(objectResult.Value);

                cache.SetObject(key, json, TimeSpan.FromMinutes(10));

                Console.WriteLine($"Cache set for key: {key}"); 
            }
        }
    }
}
