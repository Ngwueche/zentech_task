using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Products.IntegrationTests.Infrastructure;

namespace Products.IntegrationTests;

[Collection("Products API")]
public sealed class HealthTests(ProductsApiFactory factory)
{
    [Fact]
    public async Task GetHealth_WithoutAuthentication_ShouldReturn200()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetHealth_ResponseBody_ShouldContainHealthyStatus()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();

        body.GetProperty("status").GetString().Should().Be("Healthy");
    }
}
