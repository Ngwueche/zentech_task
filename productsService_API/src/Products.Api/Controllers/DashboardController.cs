using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Products.Application.Abstractions;
using Products.Application.Common;
using Products.Application.Products;

namespace Products.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
[Tags("Dashboard")]
public sealed class DashboardController(IProductService productService) : ControllerBase
{
    /// <summary>
    /// Returns high-level inventory statistics: total product count, total stock quantity,
    /// and a list of items with quantity below 5 ordered by quantity ascending.
    /// </summary>
    [HttpGet]
    [ProducesResponseType<ApiResponse<DashboardResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await productService.GetDashboardAsync(cancellationToken);
        return Ok(ApiResponse<DashboardResponse>.Success(result));
    }
}
