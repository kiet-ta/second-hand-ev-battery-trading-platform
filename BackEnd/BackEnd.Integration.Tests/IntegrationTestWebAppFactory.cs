using Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BackEnd.Integration.Tests;

// This factory is used to create a test server for the application.
// It is customized to use the database running in the Testcontainer.
public class IntegrationTestWebAppFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    // The DatabaseFixture provides the running MsSqlContainer instance.
    private readonly DatabaseFixture _fixture;

    public IntegrationTestWebAppFactory(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }

    // This method configures the web host for the test environment.
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // 1. Remove the existing DbContext registration.
            // This prevents the real database connection from being used.
            services.RemoveAll(typeof(DbContextOptions<EvBatteryTradingContext>));

            // 2. Add a new DbContext registration.
            // It is configured to use the connection string from the MsSqlContainer.
            services.AddDbContext<EvBatteryTradingContext>(options =>
            {
                options.UseSqlServer(_fixture.MsSqlContainer.GetConnectionString());
            });

            // 3. Ensure the database is created for the test run.
            var serviceProvider = services.BuildServiceProvider();
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<EvBatteryTradingContext>();
            dbContext.Database.EnsureCreated();
        });
    }
}