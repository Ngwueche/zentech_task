using FluentValidation;
using Products.Application.Abstractions;
using Products.Application.Common;
using Products.Application.Events;
using Products.Domain.Entities;
using AppValidationException = Products.Application.Common.Exceptions.ValidationException;
using NotFoundException = Products.Application.Common.Exceptions.NotFoundException;

namespace Products.Application.Products;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventPublisher _eventPublisher;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IValidator<CreateProductRequest> _createValidator;
    private readonly IValidator<UpdateProductRequest> _updateValidator;

    public ProductService(IProductRepository repository, IUnitOfWork unitOfWork, IEventPublisher eventPublisher, IDateTimeProvider dateTimeProvider, IValidator<CreateProductRequest> createValidator, IValidator<UpdateProductRequest> updateValidator)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _eventPublisher = eventPublisher;
        _dateTimeProvider = dateTimeProvider;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    private const int LowStockThreshold = 5;

    public async Task<DashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var (totalItems, totalQuantity, lowStockProducts) =
            await _repository.GetDashboardStatsAsync(LowStockThreshold, cancellationToken);

        return new DashboardResponse(
            totalItems,
            totalQuantity,
            lowStockProducts);
    }

    public async Task<ProductResponse> CreateAsync(
        CreateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateAsync(_createValidator, request, cancellationToken);

        var now = _dateTimeProvider.UtcNow;

        var product = Product.Create(request.Name, request.Description, request.Colour, request.Price, request.StockQuantity, now);

        await _repository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _eventPublisher.PublishAsync(
            new ProductCreatedIntegrationEvent(
                product.Id,
                product.Name,
                product.Colour,
                product.Price,
                now),
            cancellationToken);

        return MapToResponse(product);
    }

    public async Task<ProductResponse> GetByIdAsync(Guid id,CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        return MapToResponse(product);
    }

    public async Task<PagedResult<ProductResponse>> GetAllAsync(
        GetProductsRequest request,
        CancellationToken cancellationToken = default)
    {
        List<ValidationError> errors = [];
        if (request.Page < 1)
            errors.Add(new ValidationError(nameof(request.Page), "Page must be at least 1."));
        if (request.PageSize < 1)
            errors.Add(new ValidationError(nameof(request.PageSize), "PageSize must be at least 1."));
        if (request.PageSize > 100)
            errors.Add(new ValidationError(nameof(request.PageSize), "PageSize cannot exceed 100."));
        if (errors.Count > 0)
            throw new AppValidationException(errors);

        var (items, totalCount) = await _repository.GetPagedAsync(
            request.Search,
            request.Page,
            request.PageSize,
            cancellationToken);

        return new PagedResult<ProductResponse>(
            items.Select(MapToResponse).ToList(),
            request.Page,
            request.PageSize,
            totalCount);
    }

    public async Task<ProductResponse> UpdateAsync(Guid id,UpdateProductRequest request,CancellationToken cancellationToken = default)
    {
        await ValidateAsync(_updateValidator, request, cancellationToken);

        var product = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        var now = _dateTimeProvider.UtcNow;
        product.UpdateDetails(request.Name, request.Description, request.Colour, request.Price, now);
        product.UpdateStock(request.StockQuantity, now);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponse(product);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Product), id);

        await _repository.DeleteAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static async Task ValidateAsync<T>(IValidator<T> validator,T instance,CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(instance, cancellationToken);
        if (!result.IsValid)
        {
            var errors = result.Errors
                .Select(e => new ValidationError(e.PropertyName, e.ErrorMessage))
                .ToList();
            throw new AppValidationException(errors);
        }
    }

    private static ProductResponse MapToResponse(Product product) =>
        new(
            product.Id,
            product.Name,
            product.Description,
            product.Colour,
            product.Price,
            product.StockQuantity,
            product.CreatedAtUtc,
            product.UpdatedAtUtc);
}
