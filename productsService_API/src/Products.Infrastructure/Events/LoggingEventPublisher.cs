using Microsoft.Extensions.Logging;
using Products.Application.Abstractions;

namespace Products.Infrastructure.Events;

/// <summary>
/// Development implementation of <see cref="IEventPublisher"/> that writes each
/// integration event as a structured log entry via Serilog.
/// No message-broker infrastructure is required.
///
/// Replace this registration in <c>InfrastructureServiceExtensions</c> with a
/// broker-backed implementation (RabbitMQ, Kafka, Azure Service Bus, AWS SNS/SQS)
/// when deploying to a distributed environment.
/// </summary>
internal sealed class LoggingEventPublisher : IEventPublisher
{
    private readonly ILogger<LoggingEventPublisher> _logger;

    public LoggingEventPublisher(ILogger<LoggingEventPublisher> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class
    {
        _logger.LogInformation(
            "Integration event published: {EventType} {@EventPayload}",
            typeof(TEvent).Name,
            @event);

        return Task.CompletedTask;
    }
}
