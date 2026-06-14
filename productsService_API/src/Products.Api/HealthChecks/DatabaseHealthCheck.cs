using Microsoft.Extensions.Diagnostics.HealthChecks;
using Products.Infrastructure.Persistence;

namespace Products.Api.HealthChecks;

/// <summary>
/// Verifies that the application can open a connection to the configured database.
/// Exposed via GET /health through <see cref="HealthCheckService"/>.
/// </summary>
internal sealed class DatabaseHealthCheck(IServiceScopeFactory scopeFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // DbContext is scoped; create a short-lived scope for the check.
            await using var scope = scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await db.Database.CanConnectAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Cannot reach the database.", ex);
        }
    }
}
