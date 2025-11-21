namespace PresentationLayer.Extensions;

public static class PresentationExtensions
{
    public static IServiceCollection AddPresentationServices(this IServiceCollection services)
    {
        // Controller
        services.AddControllers();

        // Cors
        services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp",
                policy =>
                {
                    policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            options.AddPolicy("AllowNgrok",
                policy =>
                {
                    policy.WithOrigins("https://318132ab9f7d.ngrok-free.app")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
        });

        // AddHttp
        services.AddHttpContextAccessor();

        //SignalR
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true;
            options.MaximumReceiveMessageSize = 102400000;
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}
