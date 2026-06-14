# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy only project files first so NuGet restore is layer-cached.
# Re-runs only when a .csproj changes, not on every source edit.
COPY src/Products.Domain/Products.Domain.csproj                     src/Products.Domain/
COPY src/Products.Application/Products.Application.csproj           src/Products.Application/
COPY src/Products.Infrastructure/Products.Infrastructure.csproj     src/Products.Infrastructure/
COPY src/Products.Api/Products.Api.csproj                           src/Products.Api/

RUN dotnet restore src/Products.Api/Products.Api.csproj

# Copy source and publish a self-contained, Release build.
COPY src/ src/
RUN dotnet publish src/Products.Api/Products.Api.csproj \
        --configuration Release \
        --no-restore \
        --output /app/publish

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Run as a non-root user to limit the blast radius of any container escape.
RUN addgroup --system appgroup \
 && adduser  --system --ingroup appgroup --no-create-home appuser
USER appuser

COPY --from=build --chown=appuser:appgroup /app/publish .

# .NET 8+ containers default to port 8080 (HTTP).
# TLS termination is handled by the upstream reverse proxy / ingress controller.
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Products.Api.dll"]
