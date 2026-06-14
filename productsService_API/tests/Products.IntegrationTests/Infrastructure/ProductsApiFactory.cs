using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Products.Api.Controllers;
using Products.Infrastructure.Persistence;

namespace Products.IntegrationTests.Infrastructure;

/// <summary>
/// Spins up the full Products API with an isolated in-memory SQLite database.
/// One factory instance is shared across all tests in the "Products API" collection.
/// </summary>
public sealed class ProductsApiFactory : WebApplicationFactory<HealthController>, IAsyncLifetime
{
    // Single open connection keeps the in-memory SQLite database alive for the
    // lifetime of the factory. All DbContext instances created from it share the schema.
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    /// <summary>A valid JWT token fetched during initialization — ready for authenticated tests.</summary>
    public string JwtToken { get; private set; } = string.Empty;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        // Suppress all logging noise during tests.
        builder.ConfigureLogging(logging => logging.ClearProviders());

        builder.ConfigureServices(services =>
        {
            // Swap out the production SQLite file-based DbContext for the in-memory connection.
            var realOptions = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>))
                .ToList();

            foreach (var descriptor in realOptions)
                services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    // ── IAsyncLifetime ───────────────────────────────────────────────────────

    async Task IAsyncLifetime.InitializeAsync()
    {
        await _connection.OpenAsync();

        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
        await DatabaseSeeder.SeedAsync(db);

        JwtToken = await FetchJwtTokenAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await _connection.DisposeAsync();
        await base.DisposeAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>Returns an HttpClient with the Bearer token pre-set.</summary>
    public HttpClient CreateAuthenticatedClient()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", JwtToken);
        return client;
    }

    private async Task<string> FetchJwtTokenAsync()
    {
        using var client = CreateClient();

        var body = JsonSerializer.Serialize(new { username = "admin", password = "Admin@12345" });
        using var content = new StringContent(body, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("/api/auth/login", content);

        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        return doc.RootElement.GetProperty("accessToken").GetString()!;
    }
}
