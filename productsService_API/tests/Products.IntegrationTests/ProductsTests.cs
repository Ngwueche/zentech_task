using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Products.IntegrationTests.Infrastructure;

namespace Products.IntegrationTests;

[Collection("Products API")]
public sealed class ProductsTests(ProductsApiFactory factory)
{
    // ── POST /api/products ───────────────────────────────────────────────────

    [Fact]
    public async Task CreateProduct_WithValidRequest_ShouldReturn201Created()
    {
        using var client = factory.CreateAuthenticatedClient();
        using var content = BuildProductContent("Integration Widget", "Created via integration test", "Purple", 99.99m, 50);

        var response = await client.PostAsync("/api/products", content);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isSuccess").GetBoolean().Should().BeTrue();
        body.GetProperty("data").GetProperty("name").GetString().Should().Be("Integration Widget");
        body.GetProperty("data").GetProperty("colour").GetString().Should().Be("Purple");
        body.GetProperty("data").GetProperty("id").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateProduct_WithEmptyName_ShouldReturn422UnprocessableEntity()
    {
        using var client = factory.CreateAuthenticatedClient();
        using var content = BuildProductContent("", "Desc", "Red", 10m, 1);

        var response = await client.PostAsync("/api/products", content);

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isSuccess").GetBoolean().Should().BeFalse();
        body.GetProperty("errors").GetArrayLength().Should().BeGreaterThan(0);
    }

    // ── GET /api/products (paginated) ────────────────────────────────────────

    [Fact]
    public async Task GetProducts_Authenticated_ShouldReturn200WithPagedResult()
    {
        using var client = factory.CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/products");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isSuccess").GetBoolean().Should().BeTrue();

        var data = body.GetProperty("data");
        // At minimum the 6 seeded products are present in the first page
        data.GetProperty("items").GetArrayLength().Should().BeGreaterThanOrEqualTo(6);
        data.GetProperty("page").GetInt32().Should().Be(1);
        data.GetProperty("pageSize").GetInt32().Should().Be(10);
        data.GetProperty("totalCount").GetInt32().Should().BeGreaterThanOrEqualTo(6);
        data.GetProperty("totalPages").GetInt32().Should().BeGreaterThanOrEqualTo(1);
    }

    [Fact]
    public async Task GetProducts_WithPageSize1_ShouldReturnCorrectPaginationMetadata()
    {
        using var client = factory.CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/products?page=1&pageSize=1");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var data = (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("data");
        data.GetProperty("items").GetArrayLength().Should().Be(1);
        data.GetProperty("page").GetInt32().Should().Be(1);
        data.GetProperty("pageSize").GetInt32().Should().Be(1);
        data.GetProperty("hasNextPage").GetBoolean().Should().BeTrue();
        data.GetProperty("hasPreviousPage").GetBoolean().Should().BeFalse();
    }

    [Fact]
    public async Task GetProducts_WithInvalidPage_ShouldReturn422()
    {
        using var client = factory.CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/products?page=0");

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task GetProducts_FilteredByBlue_ShouldReturnOnlyBlueProducts()
    {
        using var client = factory.CreateAuthenticatedClient();

        // Create a Blue product to ensure the filter has something to return.
        using var createContent = BuildProductContent("Blue Filter Widget", "Colour filter test", "Blue", 9.99m, 1);
        await client.PostAsync("/api/products", createContent);

        var response = await client.GetAsync("/api/products?colour=Blue");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var items = body.GetProperty("data").GetProperty("items").EnumerateArray().ToList();
        items.Should().NotBeEmpty();
        items.Should().AllSatisfy(p =>
            p.GetProperty("colour").GetString().Should().Be("Blue"));
    }

    [Fact]
    public async Task GetProducts_WithSearchTerm_ShouldReturnMatchingProducts()
    {
        using var client = factory.CreateAuthenticatedClient();

        // "Laptop" is in the name of one of the seeded products.
        var response = await client.GetAsync("/api/products?search=Laptop");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var items = body.GetProperty("data").GetProperty("items").EnumerateArray().ToList();
        items.Should().NotBeEmpty();
        items.Should().AllSatisfy(p =>
            p.GetProperty("name").GetString()!.Contains("Laptop", StringComparison.OrdinalIgnoreCase)
                .Should().BeTrue());
    }

    // ── GET /api/products/{id} ───────────────────────────────────────────────

    [Fact]
    public async Task GetProductById_WhenProductExists_ShouldReturn200WithCorrectProduct()
    {
        using var client = factory.CreateAuthenticatedClient();

        // Resolve a real ID from the seeded dataset.
        var listResponse = await client.GetAsync("/api/products");
        var listBody = await listResponse.Content.ReadFromJsonAsync<JsonElement>();
        var first = listBody.GetProperty("data").GetProperty("items").EnumerateArray().First();
        var productId = first.GetProperty("id").GetGuid();
        var productName = first.GetProperty("name").GetString();

        var response = await client.GetAsync($"/api/products/{productId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("isSuccess").GetBoolean().Should().BeTrue();
        body.GetProperty("data").GetProperty("id").GetGuid().Should().Be(productId);
        body.GetProperty("data").GetProperty("name").GetString().Should().Be(productName);
    }

    [Fact]
    public async Task GetProductById_WhenProductDoesNotExist_ShouldReturn404()
    {
        using var client = factory.CreateAuthenticatedClient();

        var response = await client.GetAsync($"/api/products/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static StringContent BuildProductContent(
        string name, string description, string colour, decimal price, int stockQuantity)
    {
        var json = JsonSerializer.Serialize(new { name, description, colour, price, stockQuantity });
        return new StringContent(json, Encoding.UTF8, "application/json");
    }
}
