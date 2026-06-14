namespace Products.Domain.Entities;

public sealed class Product
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string Colour { get; private set; }
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    // Required by EF Core to materialise entities from the database.
    private Product()
    {
        Name = string.Empty;
        Description = string.Empty;
        Colour = string.Empty;
    }

    /// <summary>
    /// Factory that enforces invariants before a Product can exist.
    /// Callers must supply the creation timestamp (from IDateTimeProvider).
    /// </summary>
    public static Product Create(string name,string description,string colour,decimal price,int stockQuantity,DateTime createdAtUtc)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(colour);

        if (price < 0)
            throw new ArgumentOutOfRangeException(nameof(price), "Price cannot be negative.");

        if (stockQuantity < 0)
            throw new ArgumentOutOfRangeException(nameof(stockQuantity), "Stock quantity cannot be negative.");

        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Description = description.Trim(),
            Colour = colour.Trim(),
            Price = price,
            StockQuantity = stockQuantity,
            CreatedAtUtc = createdAtUtc
        };
    }

    public void UpdateDetails(
        string name,
        string description,
        string colour,
        decimal price,
        DateTime updatedAtUtc)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(colour);

        if (price < 0)
            throw new ArgumentOutOfRangeException(nameof(price), "Price cannot be negative.");

        Name = name.Trim();
        Description = description.Trim();
        Colour = colour.Trim();
        Price = price;
        MarkUpdated(updatedAtUtc);
    }

    public void UpdateStock(int stockQuantity, DateTime updatedAtUtc)
    {
        if (stockQuantity < 0)
            throw new ArgumentOutOfRangeException(nameof(stockQuantity), "Stock quantity cannot be negative.");

        StockQuantity = stockQuantity;
        MarkUpdated(updatedAtUtc);
    }

    private void MarkUpdated(DateTime updatedAtUtc) => UpdatedAtUtc = updatedAtUtc;
}
