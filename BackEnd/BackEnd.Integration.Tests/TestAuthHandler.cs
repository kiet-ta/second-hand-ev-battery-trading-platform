using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace BackEnd.Integration.Tests;

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    // This method is called by the authentication middleware.
    // Instead of validating a token, it creates a fake authenticated user.
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // 1. Define the claims for the fake user.
        // You can add any claims you need for your tests (e.g., roles, user ID).
        var claims = new[] {
            new Claim(ClaimTypes.Name, "TestUser"),
            new Claim(ClaimTypes.NameIdentifier, "1"), // Simulate UserId = 1
            new Claim(ClaimTypes.Role, "manager"),
        };

        // 2. Create the identity and principal.
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "TestScheme");

        // 3. Return a successful authentication result.
        var result = AuthenticateResult.Success(ticket);

        return Task.FromResult(result);
    }
}