namespace Products.Application.Abstractions;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(string userId, string username);
}
