using Microsoft.EntityFrameworkCore;
using Products.Api.Extensions;
using Products.Api.HealthChecks;
using Products.Infrastructure.DependencyInjection;
using Products.Infrastructure.Persistence;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Products API");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext());

    builder.Services.AddControllers();
    builder.Services.AddHealthChecks()
        .AddCheck<DatabaseHealthCheck>("database");

    builder.Services.AddGlobalExceptionHandling();
    builder.Services.AddJwtAuthentication(builder.Configuration);
    builder.Services.AddProductsApiCors(builder.Configuration);
    builder.Services.AddSwaggerWithJwtSupport();
    builder.Services.AddApplicationServices();
    builder.Services.AddInfrastructureServices(builder.Configuration);

    var app = builder.Build();

    await using (var scope = app.Services.CreateAsyncScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
        await DatabaseSeeder.SeedAsync(db);
    }

    app.UseGlobalExceptionHandling();

    app.UseHttpsRedirection();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors(CorsExtensions.PolicyName);

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
