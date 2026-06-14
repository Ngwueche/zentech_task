namespace Products.Api.Extensions;

public static class CorsExtensions
{
    public const string PolicyName = "ProductsApiCors";

    public static IServiceCollection AddProductsApiCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                }
                else
                {
                    // No origins explicitly configured: reject all cross-origin requests.
                    // Set Cors:AllowedOrigins (or Cors__AllowedOrigins__0) via environment
                    // variable to open specific origins in production.
                    policy.SetIsOriginAllowed(_ => false);
                }
            });
        });

        return services;
    }
}
