using Application.IRepositories.IBiddingRepositories;
using Application.IRepositories;
using Application.IServices;
using Application.Services;
using CloudinaryDotNet;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Net.payOS;
using System.Text;
using Application.DTOs;

namespace PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            //  Đăng ký DbContext (DB First)
            builder.Services.AddDbContext<EvBatteryTradingContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // DI cho Repository + Service
            //---Services
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IItemService, ItemService>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IEVDetailService, EVDetailService>();
            builder.Services.AddScoped<IBatteryDetailService, BatteryDetailService>();
            builder.Services.AddScoped<IHistorySoldService, HistorySoldService>();
            builder.Services.AddScoped<ISellerDashboardService, SellerDashboardService>();
            builder.Services.AddScoped<IAuctionService, AuctionService>();
            builder.Services.AddScoped<IOrderItemService, OrderItemService>();
            //---Repositories
            builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IItemRepository, ItemRepository>();
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<IEVDetailRepository, EVDetailRepository>();
            builder.Services.AddScoped<IBatteryDetailRepository, BatteryDetailRepository>();
            builder.Services.AddScoped<IHistorySoldRepository, HistorySoldRepository>();
            builder.Services.AddScoped<IBidRepository, BidRepository>();
            builder.Services.AddScoped<IWalletRepository, WalletRepository>();
            builder.Services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
            builder.Services.AddScoped<IEmailRepository, EmailTemplateRepository>();
            builder.Services.AddScoped<IPaymentDetailRepository, PaymentDetailRepository>();
            builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();

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
                });

            // Bind Cloudinary settings
            builder.Services.Configure<CloudinarySettings>(
                builder.Configuration.GetSection("CloudinarySettings"));

            builder.Services.AddSingleton(sp =>
            {
                var config = builder.Configuration.GetSection("CloudinarySettings").Get<CloudinarySettings>();
                return new Cloudinary(new Account(config.CloudName, config.ApiKey, config.ApiSecret));
            });

            builder.Services.AddAuthorization();

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:5173")
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    });
            });
            // register PayOS via DI (Dependency Injection)
            var payosConfig = builder.Configuration.GetSection("PayOS");

            builder.Services.AddSingleton(sp =>
            {
                var clientId = payosConfig["ClientId"];
                var apiKey = payosConfig["ApiKey"];
                var checksumKey = payosConfig["ChecksumKey"];
                return new PayOS(clientId = "abc", apiKey = "abc", checksumKey = "abc");
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            //builder.Services.AddScoped<IUserService, UserService>();
            //builder.Services.AddScoped<IUserRepository, UserRepository>();
            //builder.Services.AddScoped<IUserHelper, UserHelper>();
            //builder.Services.AddScoped<IPasswordHelper, PasswordHelper>();
            //builder.Services.AddScoped<IUserValidation, UserValidation>();

            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Configuration.AddUserSecrets<Program>(); 
            builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
            builder.Services.AddScoped<IMailService, MailService>();
            builder.Services.AddScoped<IEmailRepository, EmailTemplateRepository>();
            builder.Services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
            builder.Services.AddScoped<IWalletRepository, WalletRepository>();
            builder.Services.AddScoped<IBidRepository, BidRepository>();
            builder.Services.AddScoped<IAuctionService, AuctionService>();
            builder.Services.AddDbContext<EvBatteryTradingContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            //builder.Services.AddSwaggerGen();

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

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReactApp");
            app.UseAuthorization();

            app.MapControllers();
            app.Run();
        }
    }
}