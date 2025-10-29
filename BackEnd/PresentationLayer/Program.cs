using Application;
﻿using Application.DTOs;
using Application.DTOs.AuthenticationDtos;
using Application.DTOs.PaymentDtos;
using Application.IHelpers;
using Application.IRepositories;
using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories.IChatRepositories;
using Application.IRepositories.IManageStaffRepositories;
using Application.IRepositories.IPaymentRepositories;
using Application.IServices;
using Application.Mappings;
using Application.Services;
using Application.Validations;
using CloudinaryDotNet;
using Domain.Entities;
using FluentValidation;
using Infrastructure.Data;
using Infrastructure.Helpers;
using Infrastructure.Repositories;
using Infrastructure.Repositories.ChatRepositories;
using Infrastructure.Repositories.ManageStaffRepositories;
using Infrastructure.Ulties;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Net.payOS;
using PresentationLayer.Authorization;
using PresentationLayer.Hubs;
using PresentationLayer.Middleware;
using System.Text;

namespace PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            //  Register DbContext (DB First)
            builder.Services.AddDbContext<EvBatteryTradingContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.Configure<AppSetting>(builder.Configuration.GetSection("Google"));
            builder.Services.Configure<FirebaseOptions>(builder.Configuration.GetSection("Firebase"));

            // DI for Repository + Service
            //---Services
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IItemService, ItemService>();
            builder.Services.AddScoped<IAddressService, AddressService>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IEVDetailService, EVDetailService>();
            builder.Services.AddScoped<IBatteryDetailService, BatteryDetailService>();
            builder.Services.AddScoped<IHistorySoldService, HistorySoldService>();
            builder.Services.AddScoped<ISellerDashboardService, SellerDashboardService>();
            builder.Services.AddScoped<IAuctionService, AuctionService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<IOrderItemService, OrderItemService>();
            builder.Services.AddScoped<IFavoriteService, FavoriteService>();
            builder.Services.AddScoped<IChatService, ChatService>();
            builder.Services.AddScoped<IUploadService, UploadService>();
            builder.Services.AddScoped<IItemImageService, ItemImageService>();
            builder.Services.AddScoped<ISellerService, SellerService>();
            builder.Services.AddScoped<IManagerDashboardService, ManagerDashboardService>();
            builder.Services.AddScoped<IReviewService, ReviewService>();
            builder.Services.AddScoped<ICommissionService, CommissionService>();
            builder.Services.AddScoped<IProfanityFilterService, ProfanityFilterService>();
            //---Repositories
            builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
            builder.Services.AddScoped<IAddressRepository, AddressRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IItemRepository, ItemRepository>();
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<IEVDetailRepository, EVDetailRepository>();
            builder.Services.AddScoped<IBatteryDetailRepository, BatteryDetailRepository>();
            builder.Services.AddScoped<IHistorySoldRepository, HistorySoldRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            builder.Services.AddScoped<IBidRepository, BidRepository>();
            builder.Services.AddScoped<IWalletRepository, WalletRepository>();
            builder.Services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
            builder.Services.AddScoped<IPaymentDetailRepository, PaymentDetailRepository>();
            builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
            builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
            builder.Services.AddScoped<IItemImageRepository, ItemImageRepository>();
            builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
            builder.Services.AddScoped<IComplaintRepository, ComplaintRepository>();
            builder.Services.AddScoped<ICommissionFeeRuleRepository, CommissionFeeRuleRepository>();
            builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();

    


            // AddHttp
            builder.Services.AddHttpClient<IChatRepository, FirebaseChatRepository>();
            builder.Services.AddHttpContextAccessor();

            // JWT Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new()
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                        )
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;

                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/notificationHub") ||
                                 path.StartsWithSegments("/chatHub")))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
            //SignalR
            builder.Services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
                options.MaximumReceiveMessageSize = 102400000;
                options.KeepAliveInterval = TimeSpan.FromSeconds(15);
                options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
            });

            // Bind Cloudinary settings
            builder.Services.Configure<CloudinarySettings>(
                builder.Configuration.GetSection("CloudinarySettings"));

            // Singleton
            builder.Services.AddSingleton(sp =>
            {
                var config = builder.Configuration.GetSection("CloudinarySettings").Get<CloudinarySettings>();
                return new Cloudinary(new Account(config.CloudName, config.ApiKey, config.ApiSecret));
            });
            builder.Services.AddSingleton<IUserContextService, UserContextService>();
            builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
            builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();

            builder.Services.AddAuthorization();

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddCors(options =>
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
            // register PayOS via DI (Dependency Injection)
            var payosConfig = builder.Configuration.GetSection("PayOS");

            builder.Services.AddSingleton(sp =>
            {
                var clientId = payosConfig["Client_ID"];
                var apiKey = payosConfig["Api_Key"];
                var checksumKey = payosConfig["ChecksumKey"];
                return new PayOS(clientId, apiKey, checksumKey);
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            //builder.Services.AddScoped<IUserService, UserService>();
            //builder.Services.AddScoped<IUserRepository, UserRepository>();
            //builder.Services.AddScoped<IUserHelper, UserHelper>();
            //builder.Services.AddScoped<IPasswordHelper, PasswordHelper>();
            //builder.Services.AddScoped<IUserValidation, UserValidation>();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Configuration.AddUserSecrets<Program>();
            builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
       
            builder.Services.AddScoped<IEmailRepository, EmailTemplateRepository>();
            builder.Services.AddScoped<IMailService, MailService>();
            builder.Services.AddScoped<IValidator<PaymentRequestDto>, PaymentRequestValidator>();
            builder.Services.AddHostedService<PayOSWebhookInitializer>();
            builder.Services.AddScoped<IKYC_DocumentService, KYC_DocumentService>();
            builder.Services.AddScoped<IRedisCacheHelper, RedisCacheHelper>();
            builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
            builder.Services.AddScoped<IKYC_DocumentRepository, KYC_DocumentRepository>();
            builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
            builder.Services.AddScoped<IStaffPermissionRepository, StaffPermissionRepository>();
            builder.Services.AddScoped<IStaffManagementService, StaffManagementService>();
            builder.Services.AddAutoMapper(
                typeof(KYC_DocumentProfile).Assembly,
                typeof(AddressProfile).Assembly,
                typeof(ReviewProfile).Assembly,
                typeof(PermissionProfille).Assembly
                );
            builder.Services.AddScoped<IWalletService, WalletService>();
            //builder.Services.AddSwaggerGen();

            // News
            builder.Services.AddScoped<INewsRepository, NewsRepository>();
            builder.Services.AddScoped<INewsService, NewsService>();
            builder.Services.AddSingleton<INotificationService, NotificationService>();
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

            //Complaint
            builder.Services.AddScoped<IComplaintService, ComplaintService>();
            builder.Services.AddScoped<IComplaintRepository, ComplaintRepository>();
            




            builder.Services.AddSwaggerGen(c =>
            {
                // Thông tin cơ bản
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API EV_Battery_Trading", Version = "v1" });

                // Khai báo Security Definition (JWT Bearer)
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header using the Bearer scheme.
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer 12345abcdef'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                // Áp dụng cho tất cả API
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header,
                        },
                        new List<string>()
                    }
                });
            });

            var app = builder.Build();
            app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReactApp");
            app.UseCors("AllowNgrok");
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<ChatHub>("/chatHub");

            app.Run();
        }
    }
}