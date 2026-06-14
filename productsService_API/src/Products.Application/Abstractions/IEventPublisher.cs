namespace Products.Application.Abstractions;

/// <summary>
/// Publishes integration events to downstream subscribers.
/// </summary>
/// <remarks>
/// This abstraction decouples the domain from any specific message-broker technology.
/// The default implementation (<c>LoggingEventPublisher</c>) writes structured log
/// entries so that the publish contract is exercised in development and CI without
/// requiring broker infrastructure.
///
/// To connect a real broker, replace only the single DI registration in
/// <c>InfrastructureServiceExtensions</c> — no changes to <c>ProductService</c>
/// or any controller are required:
/// <list type="bullet">
///   <item><description>RabbitMQ — MassTransit or RabbitMQ.Client</description></item>
///   <item><description>Apache Kafka — Confluent.Kafka</description></item>
///   <item><description>Azure Service Bus — Azure.Messaging.ServiceBus</description></item>
///   <item><description>AWS SNS/SQS — AWSSDK.SimpleNotificationService or MassTransit</description></item>
/// </list>
/// </remarks>
public interface IEventPublisher
{
    /// <summary>Publishes <paramref name="event"/> to all registered subscribers.</summary>
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
        where TEvent : class;
}
