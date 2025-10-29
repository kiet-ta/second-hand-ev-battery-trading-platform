namespace Application.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; }
    public T Data { get; set; }

    public ApiResponse(T data, string message = "Request successful.")
    {
        Data = data;
        Message = message;
    }

    public class ApiErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Error { get; set; }

        public ApiErrorResponse(string error)
        {
            Error = error;
        }
    }
}