namespace Products.Application.Products;

public record UpdateProductRequest(
    string Name,
    string Description,
    string Colour,
    decimal Price,
    int StockQuantity);
