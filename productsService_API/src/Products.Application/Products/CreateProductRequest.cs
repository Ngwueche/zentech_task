namespace Products.Application.Products;

public record CreateProductRequest(
    string Name,
    string Description,
    string Colour,
    decimal Price,
    int StockQuantity);
