using FluentAssertions;
using FluentValidation;
using Moq;
using Products.Application.Abstractions;
using Products.Application.Common.Exceptions;
using Products.Application.Events;
using Products.Application.Products;
using Products.Domain.Entities;

namespace Products.UnitTests.Application;

public sealed class ProductServiceTests
{
    private readonly Mock<IProductRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<IEventPublisher> _eventPublisherMock = new();
    private readonly Mock<IDateTimeProvider> _dateTimeProviderMock = new();
    private readonly ProductService _sut;

    private readonly DateTime _fixedUtc = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    public ProductServiceTests()
    {
        _dateTimeProviderMock.Setup(d => d.UtcNow).Returns(_fixedUtc);

        _sut = new ProductService(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _eventPublisherMock.Object,
            _dateTimeProviderMock.Object,
            new CreateProductRequestValidator(),
            new UpdateProductRequestValidator());
    }

    // ── CreateAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidRequest_ShouldReturnMappedProductResponse()
    {
        var request = new CreateProductRequest("Widget Pro", "A great widget", "Blue", 49.99m, 20);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .Returns<Product, CancellationToken>((p, _) => Task.FromResult(p));

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        result.Name.Should().Be(request.Name);
        result.Description.Should().Be(request.Description);
        result.Colour.Should().Be(request.Colour);
        result.Price.Should().Be(request.Price);
        result.StockQuantity.Should().Be(request.StockQuantity);
        result.CreatedAtUtc.Should().Be(_fixedUtc);
        result.Id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAsync_WithValidRequest_ShouldPublishProductCreatedIntegrationEvent()
    {
        var request = new CreateProductRequest("Widget Pro", "A great widget", "Blue", 49.99m, 20);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .Returns<Product, CancellationToken>((p, _) => Task.FromResult(p));

        await _sut.CreateAsync(request, CancellationToken.None);

        _eventPublisherMock.Verify(
            p => p.PublishAsync(
                It.Is<ProductCreatedIntegrationEvent>(e =>
                    e.Name == request.Name &&
                    e.Price == request.Price &&
                    e.OccurredAtUtc == _fixedUtc),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    // ── GetByIdAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WhenProductExists_ShouldReturnProductResponse()
    {
        var product = Product.Create("Widget", "Desc", "Red", 19.99m, 10, _fixedUtc);

        _repositoryMock
            .Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        var result = await _sut.GetByIdAsync(product.Id, CancellationToken.None);

        result.Id.Should().Be(product.Id);
        result.Name.Should().Be(product.Name);
        result.Colour.Should().Be(product.Colour);
        result.Price.Should().Be(product.Price);
    }

    [Fact]
    public async Task GetByIdAsync_WhenProductDoesNotExist_ShouldThrowNotFoundException()
    {
        var missingId = Guid.NewGuid();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        Func<Task> act = () => _sut.GetByIdAsync(missingId, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── GetAllAsync (paginated) ──────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_WithDefaultRequest_ShouldReturnPagedResult()
    {
        var products = new List<Product>
        {
            Product.Create("Widget A", "Desc", "Blue", 10m, 5, _fixedUtc),
            Product.Create("Widget B", "Desc", "Red",  20m, 3, _fixedUtc),
        };

        _repositoryMock
            .Setup(r => r.GetPagedAsync(null, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(((IReadOnlyList<Product>)products, products.Count));

        var result = await _sut.GetAllAsync(new GetProductsRequest(), CancellationToken.None);

        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(1);
        result.HasNextPage.Should().BeFalse();
        result.HasPreviousPage.Should().BeFalse();
    }

    [Fact]
    public async Task GetAllAsync_WithColourAndSearch_ShouldPassFiltersToRepository()
    {
        const string colour = "Blue";
        const string search = "Widget";
        var products = new List<Product>
        {
            Product.Create("Blue Widget", "Desc", colour, 10m, 5, _fixedUtc),
        };

        _repositoryMock
            .Setup(r => r.GetPagedAsync(search, 1, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(((IReadOnlyList<Product>)products, products.Count));

        var result = await _sut.GetAllAsync(
            new GetProductsRequest(Search: search),
            CancellationToken.None);

        result.Items.Should().HaveCount(1);
        result.Items[0].Colour.Should().Be(colour);
        _repositoryMock.Verify(
            r => r.GetPagedAsync(search, 1, 10, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_WithSecondPage_ShouldReportPaginationMetadataCorrectly()
    {
        var products = new List<Product>
        {
            Product.Create("Widget X", "Desc", "Grey", 5m, 1, _fixedUtc),
        };

        _repositoryMock
            .Setup(r => r.GetPagedAsync(null, 2, 5, It.IsAny<CancellationToken>()))
            .ReturnsAsync(((IReadOnlyList<Product>)products, 6)); // 6 total → 2 pages of 5

        var result = await _sut.GetAllAsync(
            new GetProductsRequest(Page: 2, PageSize: 5),
            CancellationToken.None);

        result.Page.Should().Be(2);
        result.PageSize.Should().Be(5);
        result.TotalCount.Should().Be(6);
        result.TotalPages.Should().Be(2);
        result.HasPreviousPage.Should().BeTrue();
        result.HasNextPage.Should().BeFalse();
    }

    [Fact]
    public async Task GetAllAsync_WithInvalidPage_ShouldThrowValidationException()
    {
        Func<Task> act = () => _sut.GetAllAsync(
            new GetProductsRequest(Page: 0),
            CancellationToken.None);

        await act.Should().ThrowAsync<Products.Application.Common.Exceptions.ValidationException>();
    }

    [Fact]
    public async Task GetAllAsync_WithPageSizeExceedingLimit_ShouldThrowValidationException()
    {
        Func<Task> act = () => _sut.GetAllAsync(
            new GetProductsRequest(PageSize: 101),
            CancellationToken.None);

        await act.Should().ThrowAsync<Products.Application.Common.Exceptions.ValidationException>();
    }

    // ── UpdateAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_WhenProductDoesNotExist_ShouldThrowNotFoundException()
    {
        var missingId = Guid.NewGuid();
        var request = new UpdateProductRequest("New Name", "New Desc", "Green", 99m, 10);

        _repositoryMock
            .Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        Func<Task> act = () => _sut.UpdateAsync(missingId, request, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── DeleteAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_WhenProductDoesNotExist_ShouldThrowNotFoundException()
    {
        var missingId = Guid.NewGuid();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        Func<Task> act = () => _sut.DeleteAsync(missingId, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
