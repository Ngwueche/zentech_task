using Products.Application.Abstractions;

namespace Products.Infrastructure;

internal sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
