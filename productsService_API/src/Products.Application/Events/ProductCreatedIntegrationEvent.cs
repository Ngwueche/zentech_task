namespace Products.Application.Events;

/// <summary>
/// Raised after a product is successfully persisted.
/// Downstream services (e.g. Orders, Notifications) subscribe to this event
/// to keep their own read-models in sync or to trigger workflows.
/// </summary>
public record ProductCreatedIntegrationEvent(
    Guid ProductId,
    string Name,
    string Colour,
    decimal Price,
    DateTime OccurredAtUtc);
