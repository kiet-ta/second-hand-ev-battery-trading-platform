using Domain.DTOs;
using PresentationLayer;
using System.Net.Http.Json;
using Xunit;

namespace BackEnd.Integration.Tests;

// This test class uses the DatabaseFixture to ensure a fresh database container is available.
// IClassFixture tells xUnit to create one instance of DatabaseFixture for all tests in this class.
public class UserControllerTests : IClassFixture<DatabaseFixture>
{
    private readonly HttpClient _client;
    private readonly DatabaseFixture _fixture;

    public UserControllerTests(DatabaseFixture fixture)
    {
        _fixture = fixture;
        // Create an instance of the custom WebApplicationFactory, passing the fixture.
        var factory = new IntegrationTestWebAppFactory<Program>(fixture);
        // Create an HttpClient to send requests to the in-memory test server.
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllUsers_WhenNoUsersExist_ReturnsOkAndEmptyList()
    {
        // Arrange: The test database is initially empty.

        // Act: Send a GET request to the /api/user endpoint.
        var response = await _client.GetAsync("/api/user");

        // Assert:
        // Check if the request was successful
        response.EnsureSuccessStatusCode();
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);

        // Deserialize the response and check the content.
        var users = await response.Content.ReadFromJsonAsync<List<CreateAddressDTO>>();
        Assert.NotNull(users);
        Assert.Empty(users); // Expecting an empty list
    }
}