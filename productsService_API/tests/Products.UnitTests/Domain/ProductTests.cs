using FluentAssertions;
using Products.Domain.Entities;

namespace Products.UnitTests.Domain;

public sealed class ProductTests
{
    private readonly DateTime _createdAt = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_WithValidValues_ShouldSetAllProperties()
    {
        var product = Product.Create("Widget Pro", "A great widget", "Blue", 49.99m, 100, _createdAt);

        product.Id.Should().NotBeEmpty();
        product.Name.Should().Be("Widget Pro");
        product.Description.Should().Be("A great widget");
        product.Colour.Should().Be("Blue");
        product.Price.Should().Be(49.99m);
        product.StockQuantity.Should().Be(100);
        product.CreatedAtUtc.Should().Be(_createdAt);
        product.UpdatedAtUtc.Should().BeNull();
    }

    [Fact]
    public void UpdateDetails_WithValidValues_ShouldChangeNameDescriptionColourAndPrice()
    {
        var product = Product.Create("Widget", "Old desc", "Blue", 10m, 5, _createdAt);
        var updatedAt = _createdAt.AddDays(1);

        product.UpdateDetails("Widget Pro", "New desc", "Silver", 29.99m, updatedAt);

        product.Name.Should().Be("Widget Pro");
        product.Description.Should().Be("New desc");
        product.Colour.Should().Be("Silver");
        product.Price.Should().Be(29.99m);
        product.StockQuantity.Should().Be(5, because: "UpdateDetails does not change stock");
    }

    [Fact]
    public void UpdateStock_WithNewQuantity_ShouldChangeStockQuantity()
    {
        var product = Product.Create("Widget", "Desc", "Blue", 10m, 5, _createdAt);
        var updatedAt = _createdAt.AddHours(2);

        product.UpdateStock(50, updatedAt);

        product.StockQuantity.Should().Be(50);
    }

    [Fact]
    public void UpdatedAtUtc_ShouldBeNull_BeforeAnyUpdate()
    {
        var product = Product.Create("Widget", "Desc", "Blue", 10m, 5, _createdAt);

        product.UpdatedAtUtc.Should().BeNull();
    }

    [Fact]
    public void UpdatedAtUtc_ShouldReflectTimestamp_AfterUpdateDetails()
    {
        var product = Product.Create("Widget", "Desc", "Blue", 10m, 5, _createdAt);
        var updatedAt = _createdAt.AddDays(1);

        product.UpdateDetails("Widget v2", "Desc v2", "Red", 20m, updatedAt);

        product.UpdatedAtUtc.Should().Be(updatedAt);
    }

    [Fact]
    public void UpdatedAtUtc_ShouldReflectTimestamp_AfterUpdateStock()
    {
        var product = Product.Create("Widget", "Desc", "Blue", 10m, 5, _createdAt);
        var updatedAt = _createdAt.AddHours(3);

        product.UpdateStock(99, updatedAt);

        product.UpdatedAtUtc.Should().Be(updatedAt);
    }
}
