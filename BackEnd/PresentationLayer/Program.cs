using Application.IRepositories;
using Application.Services;
using Domain.Mappings;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // ================== 1. Add Services ==================
            builder.Services.AddControllers();

            // Database connection
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Repository & Service DI
            builder.Services.AddScoped<IKYC_DocumentRepository, KYC_DocumentRepository>();
            builder.Services.AddScoped<IKYC_DocumentService, KYC_DocumentService>();

            // AutoMapper
            builder.Services.AddAutoMapper(typeof(KYC_DocumentProfile).Assembly);

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // ================== 2. Configure Middlewares ==================
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // N?u có auth thì b?t cái này:
            // app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
