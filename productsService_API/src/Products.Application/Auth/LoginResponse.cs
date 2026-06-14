namespace Products.Application.Auth;

public record LoginResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    string TokenType = "Bearer");
