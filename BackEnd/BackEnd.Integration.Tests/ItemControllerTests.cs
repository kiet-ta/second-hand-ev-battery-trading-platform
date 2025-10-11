using Application.DTOs.ItemDtos;
using Domain.DTOs;
using PresentationLayer;
using System.Net;
using System.Net.Http.Json;

namespace BackEnd.Integration.Tests;

public class ItemControllerTests : IClassFixture<DatabaseFixture>
{
    private readonly HttpClient _client;

    public ItemControllerTests(DatabaseFixture fixture)
    {
        var factory = new IntegrationTestWebAppFactory<Program>(fixture);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Item_CRUD_Lifecycle_WorksCorrectly()
    {
        // Arrange
        var newItemDto = new ItemDto
        {
            Title = "New EV Car",
            Description = "A fast electric car",
            ItemType = "EV",
            Price = 50000
        };

        // Act
        var createResponse = await _client.PostAsync("/api/item", new JsonContent(newItemDto));

        // Assert
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createdItem = await createResponse.Content.ReadFromJsonAsync<ItemDto>();
        Assert.NotNull(createdItem);
        Assert.Equal("New EV Car", createdItem.Title);

        var itemId = createdItem.ItemId;

        // Act
        var getResponse = await _client.GetAsync($"/api/item/{itemId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetchedItem = await getResponse.Content.ReadFromJsonAsync<ItemDto>();
        Assert.NotNull(fetchedItem);
        Assert.Equal(itemId, fetchedItem.ItemId);

        // Arrange
        var updatedDto = new ItemDto
        {
            ItemId = itemId,
            Title = "Updated EV Car Title",
            Description = fetchedItem.Description,
            ItemType = fetchedItem.ItemType,
            Price = 55000,
        };

        // Act
        var updateResponse = await _client.PutAsync($"/api/item/{itemId}", new JsonContent(updatedDto));

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/item/{itemId}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getAfterDeleteResponse = await _client.GetAsync($"/api/item/{itemId}");
        Assert.Equal(HttpStatusCode.NotFound, getAfterDeleteResponse.StatusCode);
    }

    [Fact]
    public async Task GetItem_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = 999;

        // Act
        var response = await _client.GetAsync($"/api/item/{nonExistentId}");

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }
}