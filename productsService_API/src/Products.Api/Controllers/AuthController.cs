using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Products.Application.Abstractions;
using Products.Application.Auth;

namespace Products.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
[Tags("Authentication")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Exchange credentials for a JWT access token.</summary>
    [HttpPost("login")]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return Unauthorized(new { Message = "Username and password are required." });

        var result = await _authService.LoginAsync(request, cancellationToken);

        return result is not null
            ? Ok(result)
            : Unauthorized(new { Message = "Invalid username or password." });
    }
}
