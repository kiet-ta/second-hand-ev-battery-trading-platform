namespace Application.IHelpers;

/// <summary>
/// Abstraction for DateTime operations to enable testability.
/// Use this instead of DateTime.Now directly in services.
/// </summary>
public interface IDateTimeProvider
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}
