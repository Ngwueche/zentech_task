using Products.Application.Common;
using Products.Application.Products;


namespace Products.Application.Abstractions;

public interface IProductService
{
    Task<DashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<ProductResponse>> GetAllAsync(GetProductsRequest request, CancellationToken cancellationToken = default);
    Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
