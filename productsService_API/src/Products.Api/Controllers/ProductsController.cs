using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Products.Application.Abstractions;
using Products.Application.Common;
using Products.Application.Products;

namespace Products.Api.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
[Tags("Products")]
public sealed class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService) => _productService = productService;

    /// <summary>
    /// Returns a paginated list of products.
    /// Supports free-text search across Name and Description, and an exact colour filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<ApiResponse<PagedResult<ProductResponse>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? colour,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _productService.GetAllAsync(
            new GetProductsRequest(search, page, pageSize),
            cancellationToken);
        return Ok(ApiResponse<PagedResult<ProductResponse>>.Success(result));
    }

    /// <summary>Returns a single product by its unique identifier.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<ApiResponse<ProductResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<ProductResponse>.Success(product));
    }

    /// <summary>Creates a new product.</summary>
    [HttpPost]
    [ProducesResponseType<ApiResponse<ProductResponse>>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            ApiResponse<ProductResponse>.Success(product));
    }

    /// <summary>Updates an existing product's details and stock quantity.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType<ApiResponse<ProductResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await _productService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ProductResponse>.Success(product));
    }

    /// <summary>Deletes a product by its unique identifier.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _productService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
