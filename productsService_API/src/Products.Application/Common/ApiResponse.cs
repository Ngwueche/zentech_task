namespace Products.Application.Common;

public class ApiResponse<T>
{
    public bool IsSuccess { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<ValidationError> Errors { get; init; } = [];

    public static ApiResponse<T> Success(T data) =>
        new() { IsSuccess = true, Data = data };

    public static ApiResponse<T> Failure(string message) =>
        new() { IsSuccess = false, Message = message };

    public static ApiResponse<T> ValidationFailure(IReadOnlyList<ValidationError> errors) =>
        new() { IsSuccess = false, Errors = errors };
}

public class ApiResponse
{
    public bool IsSuccess { get; init; }
    public string? Message { get; init; }
    public IReadOnlyList<ValidationError> Errors { get; init; } = [];

    public static ApiResponse Success(string? message = null) =>
        new() { IsSuccess = true, Message = message };

    public static ApiResponse Failure(string message) =>
        new() { IsSuccess = false, Message = message };

    public static ApiResponse ValidationFailure(IReadOnlyList<ValidationError> errors) =>
        new() { IsSuccess = false, Errors = errors };
}
