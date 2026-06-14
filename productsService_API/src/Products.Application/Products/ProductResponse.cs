namespace Products.Application.Products;

public record ProductResponse(
    Guid Id,
    string Name,
    string Description,
    string Colour,
    decimal Price,
    int StockQuantity,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
