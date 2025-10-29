using Application.DTOs;
using Application.DTOs.AuthenticationDtos;
using Application.IHelpers;
using Application.IRepositories.IChatRepositories;
using Application.IServices;
using Application.Services;
using CloudinaryDotNet;
using IdGen;
using Infrastructure.Data;
using Infrastructure.Helpers;
using Infrastructure.Messaging;
using Infrastructure.Repositories.ChatRepositories;
using Infrastructure.Ulties;
using Infrastructure.Workers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Net.payOS;

namespace PresentationLayer.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration config)
    {
        // Database
        services.AddDbContext<EvBatteryTradingContext>(options =>
            options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        // Google/Firebase
        services.Configure<AppSetting>(config.GetSection("Google"));
        services.Configure<FirebaseOptions>(config.GetSection("Firebase"));
        services.AddHttpClient<IChatRepository, FirebaseChatRepository>();

        // Cloudinary
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
        services.AddSingleton(sp =>
        {
            var cloudConfig = config.GetSection("CloudinarySettings").Get<CloudinarySettings>();
            return new Cloudinary(new Account(cloudConfig.CloudName, cloudConfig.ApiKey, cloudConfig.ApiSecret));
        });

        // Mail Service
        config.GetSection("MailSettings");
        services.Configure<MailSettings>(config.GetSection("MailSettings"));
        services.AddScoped<IMailService, MailService>();
        
        // PayOS
        var payosConfig = config.GetSection("PayOS");
        services.AddSingleton(sp => new PayOS(payosConfig["Client_ID"], payosConfig["Api_Key"], payosConfig["ChecksumKey"]));
        services.AddHostedService<PayOSWebhookInitializer>();

        // Redis Cache
        services.AddScoped<IRedisCacheHelper, RedisCacheHelper>();

        // Singletons
        services.AddSingleton<IUserContextService, UserContextService>();

        // Idgenerator
        services.AddSingleton<IIdGenerator<long>>(provider =>
        {
            var epoch = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var structure = new IdStructure(45, 2, 16); // 45 bits timestamp (miliseconds), 2 bits generator-id, 16 bits sequence
            var options = new IdGeneratorOptions(structure, new DefaultTimeSource(epoch));
            int generatorId = 1;
            var generator = new IdGenerator(generatorId, options);

            return new IdGenerator(1, options);
        });

        services.Configure<RabbitMQSettings>(config.GetSection("RabbitMQSettings"));
        services.AddSingleton(sp => sp.GetRequiredService<IOptions<RabbitMQSettings>>().Value);
        services.AddSingleton<IMessagePublisher>(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<RabbitMQSettings>>().Value;
            if (string.IsNullOrEmpty(settings.ConnectionString))
            {
                throw new InvalidOperationException("RabbitMQ ConnectionString is not configured.");
            }
            //  inject connection string into constructor
            return new RabbitMQPublisher(settings);
        });

        //  Hosted Services (Background Workers)
        services.AddHostedService<ReleaseFundsWorker>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<ReleaseFundsWorker>>();
            var serviceProvider = sp.GetRequiredService<IServiceProvider>(); // resolve scoped service
            var settings = sp.GetRequiredService<IOptions<RabbitMQSettings>>().Value; // get config
            if (string.IsNullOrEmpty(settings.ConnectionString))
            {
                throw new InvalidOperationException("RabbitMQ ConnectionString is not configured for Worker.");
            }
            return new ReleaseFundsWorker(logger, serviceProvider, settings);
        });

        services.AddHostedService<ReleaseFundsWorker>();

        return services;
    }
}
