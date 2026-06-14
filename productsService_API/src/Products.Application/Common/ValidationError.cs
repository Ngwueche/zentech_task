namespace Products.Application.Common;

public record ValidationError(string PropertyName, string ErrorMessage);
