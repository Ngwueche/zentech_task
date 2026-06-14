using Products.IntegrationTests.Infrastructure;

namespace Products.IntegrationTests;

/// <summary>
/// Shares one <see cref="ProductsApiFactory"/> instance (and its in-memory database)
/// across all test classes marked with [Collection("Products API")].
/// </summary>
[CollectionDefinition("Products API")]
public class ProductsApiCollection : ICollectionFixture<ProductsApiFactory>;
