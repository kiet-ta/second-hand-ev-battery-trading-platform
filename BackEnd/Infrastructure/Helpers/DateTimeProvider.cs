using Application.IHelpers;

namespace Infrastructure.Helpers;

/// <summary>
/// Default implementation of IDateTimeProvider using system DateTime.
/// For unit tests, mock this interface to control time.
/// </summary>
public class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
