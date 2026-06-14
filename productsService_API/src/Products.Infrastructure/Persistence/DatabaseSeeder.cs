using Microsoft.EntityFrameworkCore;
using Products.Domain.Entities;

namespace Products.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Products.AnyAsync(cancellationToken))
            return;

        var utcNow = DateTime.UtcNow;

        var products = new[]
        {
            Product.Create("Laptop Pro 15",         "High-performance laptop for professionals",    "Silver", 1299.99m, 25,  utcNow),
            Product.Create("Wireless Headphones X1","Premium noise-cancelling headphones",          "Black",   199.99m, 100, utcNow),
            Product.Create("USB-C Hub 7-in-1",      "Versatile USB-C docking hub",                 "Grey",     49.99m, 200, utcNow),
            Product.Create("Mechanical Keyboard TKL","Compact tenkeyless mechanical keyboard",     "Black",    89.99m, 75,  utcNow),
            Product.Create("27-inch 4K Monitor",    "IPS panel with HDR support",                  "Silver",  449.99m, 30,  utcNow),
            Product.Create("Ergonomic Mouse",       "Wireless vertical ergonomic mouse",            "Grey",     39.99m, 150, utcNow),
        };

        await context.Products.AddRangeAsync(products, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
