using Application.DTOs;
using PresentationLayer;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Xunit;

namespace BackEnd.Integration.Tests;

// This test class uses the DatabaseFixture to ensure a fresh database container is available.
// IClassFixture tells xUnit to create one instance of DatabaseFixture for all tests in this class.
[Trait("Category", "Integration")]
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

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestScheme");
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


    [Fact]
    public async Task GetAllUsers_WhenCalled_ReturnsOk() // Renamed for clarity
    {
        // Arrange - No specific arrangement needed.
        // The authorization header is already set in the constructor.

        // Act
        var response = await _client.GetAsync("/api/user");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}