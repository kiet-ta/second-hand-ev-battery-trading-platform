namespace BackEnd.Integration.Tests;

using Testcontainers.MsSql;
using Xunit;

// This class is a fixture responsible for managing the lifecycle of an MsSqlContainer.
// It implements IAsyncLifetime to start the container before tests run and stop it after they finish.
public class DatabaseFixture : IAsyncLifetime
{
    // The MsSqlContainer instance which will be used for the integration tests.
    public MsSqlContainer MsSqlContainer { get; }

    public DatabaseFixture()
    {
        // Initialize the MsSqlContainer with a specific image and a password.
        // A random port will be assigned on the host.
        MsSqlContainer = new MsSqlBuilder()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
            .WithPassword("12345")
            .Build();
    }

    // This method is called by xUnit before running the tests in a class that uses this fixture.
    // It starts the database container.
    public async Task InitializeAsync()
    {
        await MsSqlContainer.StartAsync();
    }

    // This method is called by xUnit after all tests in the class have run.
    // It stops and disposes of the database container to clean up resources.
    public async Task DisposeAsync()
    {
        await MsSqlContainer.StopAsync();
        await MsSqlContainer.DisposeAsync();
    }
}