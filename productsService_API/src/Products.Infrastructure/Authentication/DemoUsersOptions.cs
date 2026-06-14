namespace Products.Infrastructure.Authentication;

public sealed class DemoUsersOptions
{
    public const string SectionName = "DemoUsers";

    public List<DemoUserEntry> Users { get; init; } = [];
}

public sealed class DemoUserEntry
{
    public string Username { get; init; } = string.Empty;

    // Stored as "SHA256:iterations:saltBase64:hashBase64" — never plain text.
    public string PasswordHash { get; init; } = string.Empty;
}
