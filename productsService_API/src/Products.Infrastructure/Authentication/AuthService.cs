using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Products.Application.Abstractions;
using Products.Application.Auth;

namespace Products.Infrastructure.Authentication;

internal sealed class AuthService : IAuthService
{
    private readonly DemoUsersOptions _options;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IOptions<DemoUsersOptions> options,
        IJwtTokenGenerator tokenGenerator,
        ILogger<AuthService> logger)
    {
        _options = options.Value;
        _tokenGenerator = tokenGenerator;
        _logger = logger;
    }

    public Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = _options.Users
            .FirstOrDefault(u => u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase));

        if (user is null || !VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for username '{Username}'", request.Username);
            return Task.FromResult<LoginResponse?>(null);
        }

        var (token, expiresAt) = _tokenGenerator.GenerateToken(user.Username, user.Username);

        _logger.LogInformation("User '{Username}' authenticated successfully", user.Username);

        return Task.FromResult<LoginResponse?>(new LoginResponse(token, expiresAt, "Bearer"));
    }

    // Hash format stored in config: "SHA256:iterations:saltBase64:hashBase64"
    private static bool VerifyPassword(string inputPassword, string storedHash)
    {
        var parts = storedHash.Split(':');
        if (parts.Length != 4) return false;
        if (!parts[0].Equals("SHA256", StringComparison.OrdinalIgnoreCase)) return false;
        if (!int.TryParse(parts[1], out var iterations) || iterations < 1) return false;

        try
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expectedHash = Convert.FromBase64String(parts[3]);
            var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(inputPassword),
                salt,
                iterations,
                HashAlgorithmName.SHA256,
                32);
            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch
        {
            return false;
        }
    }
}
