namespace Products.Application.Products;

/// <summary>Query parameters for the paginated product listing endpoint.</summary>
public record GetProductsRequest(
    string? Search = null,
    int Page = 1,
    int PageSize = 10);
