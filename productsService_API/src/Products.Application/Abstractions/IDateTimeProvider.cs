namespace Products.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
