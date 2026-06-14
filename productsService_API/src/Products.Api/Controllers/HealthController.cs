using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Products.Api.Controllers;

[ApiController]
[Route("health")]
[AllowAnonymous]
[Tags("Health")]
public sealed class HealthController : ControllerBase
{
    private readonly HealthCheckService _healthCheckService;

    public HealthController(HealthCheckService healthCheckService) =>
        _healthCheckService = healthCheckService;

    /// <summary>Returns the current health status of the service.</summary>
    [HttpGet]
    [ProducesResponseType<object>(StatusCodes.Status200OK)]
    [ProducesResponseType<object>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        var report = await _healthCheckService.CheckHealthAsync(cancellationToken);

        var response = new
        {
            Status = report.Status.ToString(),
            Timestamp = DateTime.UtcNow
        };

        return report.Status == HealthStatus.Healthy
            ? Ok(response)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
    }
}
