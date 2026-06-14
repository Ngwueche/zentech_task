using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Products.Infrastructure.Persistence;

// Used by EF Core CLI tools (dotnet ef migrations add) at design time.
// Provides a DbContext without needing to run the full application host.
public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlite("Data Source=products-dev.db");
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
