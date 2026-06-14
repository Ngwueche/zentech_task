using Microsoft.EntityFrameworkCore;
using Products.Application.Abstractions;
using Products.Domain.Entities;

namespace Products.Infrastructure.Persistence;

internal sealed class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
        return product;
    }

    // Not AsNoTracking: entity may be mutated and saved in the same request (update/delete paths).
    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<Product> Items, int TotalCount)> GetPagedAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products.AsNoTracking();

        
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            // String.Contains translates to a parameterised LIKE query in EF Core.
            // SQLite LIKE is case-insensitive for ASCII, which covers all product names.
            query = query.Where(p => p.Name.Contains(term) || p.Description.Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(int TotalItems, int TotalQuantity, int LowStockItems)> GetDashboardStatsAsync(
        int lowStockThreshold,
        CancellationToken cancellationToken = default)
    {
        var base_ = _context.Products.AsNoTracking();

        var totalItems = await base_.CountAsync(cancellationToken);
        var totalQuantity = totalItems == 0 ? 0 : await base_.SumAsync(p => p.StockQuantity, cancellationToken);
        var lowStockItems = await base_
            .Where(p => p.StockQuantity < lowStockThreshold)
            .OrderBy(p => p.StockQuantity)
            .ToListAsync(cancellationToken);

        var lowStockCount = lowStockItems.Count;

        return (totalItems, totalQuantity, lowStockCount);
    }

    public Task DeleteAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Remove(product);
        return Task.CompletedTask;
    }
}
