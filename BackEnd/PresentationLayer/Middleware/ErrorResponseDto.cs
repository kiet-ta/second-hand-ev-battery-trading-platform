using System.Text.Json;

namespace PresentationLayer.Middleware;

public class ErrorResponseDto
{
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public string Details { get; set; }

    public override string? ToString()
    {
        return JsonSerializer.Serialize(this, new JsonSerializerOptions()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });
    }
}