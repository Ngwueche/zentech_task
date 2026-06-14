using Products.Application.Abstractions;

namespace Products.Infrastructure.Events;

/// <summary>
/// Silent no-op implementation of <see cref="IEventPublisher"/>.
/// Discards all integration events without logging or forwarding them.
/// </summary>
/// <remarks>
/// Useful when event publishing must be disabled — for example, in environments
/// where no message broker is available and log noise must be suppressed.
///
/// To activate, change the DI registration in <c>InfrastructureServiceExtensions</c>:
/// <code>services.AddScoped&lt;IEventPublisher, NoOpEventPublisher&gt;();</code>
/// </remarks>
internal sealed class NoOpEventPublisher : IEventPublisher
{
    public Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class => Task.CompletedTask;
}
