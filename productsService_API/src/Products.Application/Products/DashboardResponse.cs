namespace Products.Application.Products;

public record DashboardResponse(
    int TotalItems,
    int TotalQuantity,
    int LowStockItems);
