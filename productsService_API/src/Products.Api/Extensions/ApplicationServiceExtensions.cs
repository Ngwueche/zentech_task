using FluentValidation;
using Products.Application.Abstractions;
using Products.Application.Products;

namespace Products.Api.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();

        services.AddScoped<IValidator<CreateProductRequest>, CreateProductRequestValidator>();
        services.AddScoped<IValidator<UpdateProductRequest>, UpdateProductRequestValidator>();

        return services;
    }
}
