using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Products.IntegrationTests.Infrastructure;

namespace Products.IntegrationTests;

[Collection("Products API")]
public sealed class AuthenticationTests(ProductsApiFactory factory)
{
    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturn200()
    {
        using var client = factory.CreateClient();
        using var content = BuildLoginContent("admin", "Admin@12345");

        var response = await client.PostAsync("/api/auth/login", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnAccessToken()
    {
        using var client = factory.CreateClient();
        using var content = BuildLoginContent("admin", "Admin@12345");

        var response = await client.PostAsync("/api/auth/login", content);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        body.GetProperty("accessToken").GetString().Should().NotBeNullOrWhiteSpace();
        body.GetProperty("tokenType").GetString().Should().Be("Bearer");
        body.GetProperty("expiresAtUtc").GetString().Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ShouldReturn401()
    {
        using var client = factory.CreateClient();
        using var content = BuildLoginContent("admin", "WrongPassword!");

        var response = await client.PostAsync("/api/auth/login", content);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithUnknownUsername_ShouldReturn401()
    {
        using var client = factory.CreateClient();
        using var content = BuildLoginContent("nobody", "Admin@12345");

        var response = await client.PostAsync("/api/auth/login", content);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private static StringContent BuildLoginContent(string username, string password)
    {
        var json = JsonSerializer.Serialize(new { username, password });
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
}
