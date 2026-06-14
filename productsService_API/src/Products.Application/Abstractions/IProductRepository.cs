using Products.Domain.Entities;

namespace Products.Application.Abstractions;

public interface IProductRepository
{
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a page of products, optionally filtered by <paramref name="colour"/> and/or
    /// a free-text <paramref name="search"/> term matched against Name and Description.
    /// </summary>
    Task<(IReadOnlyList<Product> Items, int TotalCount)> GetPagedAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<(int TotalItems, int TotalQuantity, int LowStockItems)> GetDashboardStatsAsync(
        int lowStockThreshold,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Product product, CancellationToken cancellationToken = default);
}
