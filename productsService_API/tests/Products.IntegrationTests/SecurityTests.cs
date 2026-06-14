using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Products.IntegrationTests.Infrastructure;

namespace Products.IntegrationTests;

[Collection("Products API")]
public sealed class SecurityTests(ProductsApiFactory factory)
{
    [Fact]
    public async Task GetProducts_WithoutToken_ShouldReturn401()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/products");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateProduct_WithoutToken_ShouldReturn401()
    {
        using var client = factory.CreateClient();
        var payload = JsonSerializer.Serialize(
            new { name = "Widget", description = "Desc", colour = "Blue", price = 10m, stockQuantity = 1 });

        using var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/api/products", content);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
