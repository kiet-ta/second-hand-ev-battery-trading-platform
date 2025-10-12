using Application.DTOs.AuctionDtos;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Org.BouncyCastle.Crypto.Operators;
using PresentationLayer;
using System.Net;
using System.Net.Http.Json;

namespace BackEnd.Integration.Tests;

public class AuctionControllerTests : IClassFixture<DatabaseFixture>
{
    private readonly HttpClient _client;
    private readonly IntegrationTestWebAppFactory<Program> _factory;

    public AuctionControllerTests(DatabaseFixture fixture)
    {
        _factory = new IntegrationTestWebAppFactory<Program>(fixture);
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task CreateAuction_WithValidData_ReturnsOk()
    {
        // Arrange
        // We need to seed required data first, e.g., an Item.
        // We can access the DbContext from the factory to set up data.
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EvBatteryTradingContext>();

        var testItem = new Item { Title = "Test Item for Auction", Price = 1000 };
        context.Items.Add(testItem);
        await context.SaveChangesAsync();

        var request = new CreateAuctionRequest
        {
            ItemId = testItem.ItemId,
            StartTime = DateTime.UtcNow.AddDays(1),
            EndTime = DateTime.UtcNow.AddDays(2)
        };

        // Act
        var response = await _client.PostAsync("/api/auction", new JsonContent(request));

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var createdAuction = await response.Content.ReadFromJsonAsync<CreateAuctionResponse>();
        Assert.NotNull(createdAuction);
        Assert.Equal(testItem.ItemId, createdAuction.ItemId);
    }

    [Fact]
    public async Task GetAllAuction_ReturnsSuccessStatusCode()
    {
        // Arrange (optional: you could clear and seed data here if needed)

        // Act
        var response = await _client.GetAsync("/api/auction");

        // Assert
        response.EnsureSuccessStatusCode(); // Throws exception if not 2xx
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}