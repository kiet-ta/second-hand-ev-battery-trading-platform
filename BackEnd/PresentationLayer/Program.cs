
using Net.payOS;

namespace PresentationLayer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            
            // register PayOS via DI (Dependency Injection)
            var payosConfig = builder.Configuration.GetSection("PayOS");

            builder.Services.AddSingleton(sp =>
            {
                var clientId = payosConfig["ClientId"];
                var apiKey = payosConfig["ApiKey"];
                var checksumKey = payosConfig["ChecksumKey"];
                return new PayOS(clientId, apiKey, checksumKey);
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
