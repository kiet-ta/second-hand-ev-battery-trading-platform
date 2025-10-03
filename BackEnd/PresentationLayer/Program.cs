using Net.payOS;
using Application.IHelpers;
using Application.IRepositories;
using Application.IValidations;
using Domain.Entities;
using Helper;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;
using Application.Services;
using Application.IServices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Infrastructure.Config;
using CloudinaryDotNet;
namespace PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReact", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                    .WithOrigins("http://localhost:5173")
                    .WithOrigins("http://localhost:5174")
                    .WithOrigins("http://localhost:5175")
                    .WithOrigins("http://localhost:5176")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
            });
            //  Đăng ký DbContext (DB First)
            builder.Services.AddDbContext<EvBatteryTradingContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // DI cho Repository + Service
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IItemRepository, ItemRepository>();
            //builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            builder.Services.AddScoped<IItemService, ItemService>();

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
            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddEndpointsApiExplorer();
            //builder.Services.AddSwaggerGen();
            builder.Services.AddSwaggerGen(c =>
            {
                // Thông tin cơ bản
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

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

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseRouting();

            app.UseHttpsRedirection();

            app.UseCors("AllowReact");

            app.UseAuthentication();

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}