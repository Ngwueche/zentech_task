using FluentAssertions;
using Products.Application.Products;

namespace Products.UnitTests.Validators;

public sealed class CreateProductRequestValidatorTests
{
    private readonly CreateProductRequestValidator _validator = new();

    [Fact]
    public async Task Validate_ShouldFail_WhenNameIsEmpty()
    {
        var request = new CreateProductRequest(string.Empty, "A description", "Red", 10m, 5);

        var result = await _validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductRequest.Name));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenColourIsEmpty()
    {
        var request = new CreateProductRequest("Widget", "A description", string.Empty, 10m, 5);

        var result = await _validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductRequest.Colour));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenPriceIsZero()
    {
        var request = new CreateProductRequest("Widget", "A description", "Red", 0m, 5);

        var result = await _validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductRequest.Price));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenPriceIsNegative()
    {
        var request = new CreateProductRequest("Widget", "A description", "Red", -1m, 5);

        var result = await _validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductRequest.Price));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenStockQuantityIsNegative()
    {
        var request = new CreateProductRequest("Widget", "A description", "Red", 10m, -1);

        var result = await _validator.ValidateAsync(request);

        result.IsValid.Should().BeFalse();
        result.Errors.Should()
            .Contain(e => e.PropertyName == nameof(CreateProductRequest.StockQuantity));
    }

    [Fact]
    public async Task Validate_ShouldPass_ForValidRequest()
    {
        var request = new CreateProductRequest("Widget", "A description", "Red", 10m, 0);

        var result = await _validator.ValidateAsync(request);

        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }
}
