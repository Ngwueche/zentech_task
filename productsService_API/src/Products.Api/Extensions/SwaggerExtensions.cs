using Microsoft.OpenApi;

namespace Products.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerWithJwtSupport(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Products API",
                Version = "v1",
                Description = "Clean Architecture Products REST API with JWT authentication."
            });

            const string scheme = "Bearer";

            options.AddSecurityDefinition(scheme, new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Enter your JWT token: **Bearer &lt;token&gt;**",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header
            });

            options.AddSecurityRequirement(doc =>
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecuritySchemeReference(scheme, doc),
                        []
                    }
                });
        });

        return services;
    }
}
