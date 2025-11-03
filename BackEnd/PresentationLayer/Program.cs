    using Application.DTOs;
using Infrastructure.Workers;
using PresentationLayer.Extensions;
using PresentationLayer.Hubs;
using PresentationLayer.Middleware;

namespace PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var config = builder.Configuration;
            //presentation
            builder.Services.AddPresentationServices();
            // infrastructure third party
            builder.Services.AddInfrastructureServices(config);

            //bussiness logic
            builder.Services.AddApplicationServices();

            //document, controller, auth,e.g.
            builder.Services.AddSwaggerAndAuth(config);
            
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Configuration.AddUserSecrets<Program>();

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