using Microsoft.AspNetCore.Diagnostics;
using Products.Application.Common;
using AppValidationException = Products.Application.Common.Exceptions.ValidationException;
using NotFoundException = Products.Application.Common.Exceptions.NotFoundException;

namespace Products.Api.Middleware;

internal sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) =>
        _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, response) = exception switch
        {
            NotFoundException nfe =>
                (StatusCodes.Status404NotFound,
                 ApiResponse.Failure(nfe.Message)),
            AppValidationException vex =>
                (StatusCodes.Status422UnprocessableEntity,
                 ApiResponse.ValidationFailure(vex.Errors)),
            _ =>
                (StatusCodes.Status500InternalServerError,
                 ApiResponse.Failure("An unexpected error occurred."))
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(
                exception,
                "Unhandled exception processing {Method} {Path}",
                httpContext.Request.Method,
                httpContext.Request.Path.Value);
        }
        else
        {
            _logger.LogWarning(
                "{ExceptionType}: {Message}",
                exception.GetType().Name,
                exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }
}
