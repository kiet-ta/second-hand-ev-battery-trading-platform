using Google.Apis.Http;
using Org.BouncyCastle.Pqc.Crypto.Utilities;
using System;
using System.Net;
using System.Security;

namespace PresentationLayer.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            //handle error
            _logger.LogError(ex, "Unexpected Error: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        var response = context.Response;
        var errorResponse = new ErrorResponseDto();
        switch (exception)
        {
            case Exception ex when ex is ArgumentException || ex is InvalidOperationException:
                // Bad Request: Invalid arguments or invalid operation caused by client input (e.g., EndTime < StartTime)
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = ex.Message;
                break;

            case KeyNotFoundException ex:
                // Not Found: Resource not found (e.g., ItemId does not exist)
                errorResponse.StatusCode = (int)HttpStatusCode.NotFound; // 404
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.Message = ex.Message;
                break;

            case UnauthorizedAccessException ex:
                // Unauthorized: The user is not authenticated or lacks valid credentials
                errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized; // 401
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = "Access denied. Authentication required.";
                break;

            case SecurityException ex:
                // Forbidden: The user is authenticated but does not have permission
                errorResponse.StatusCode = (int)HttpStatusCode.Forbidden; // 403
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                errorResponse.Message = "You do not have permission to access this resource.";
                break;

            case TimeoutException ex:
                // Request Timeout: Operation took too long to complete
                errorResponse.StatusCode = (int)HttpStatusCode.RequestTimeout; // 408
                response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                errorResponse.Message = "The request timed out. Please try again.";
                break;

            case Microsoft.EntityFrameworkCore.DbUpdateException ex:
                // Database Update Error: Failed to update data in the database
                errorResponse.StatusCode = (int)HttpStatusCode.Conflict; // 409
                response.StatusCode = (int)HttpStatusCode.Conflict;
                errorResponse.Message = "Database update failed. Check your data and try again.";
                break;

            case NullReferenceException ex:
                // Null Reference: A null object was accessed unexpectedly
                errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError; // 500
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.Message = "Unexpected null value encountered in the system.";
                break;

            default:
                // Internal Server Error: Unhandled or unknown exception
                errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError; // 500
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.Message = "An unexpected system error occurred. Please try again later.";
                break;
        }
        if (_env.IsDevelopment())
        {
            errorResponse.Details = exception.StackTrace;
        }
        errorResponse.Details = exception.StackTrace;

        await context.Response.WriteAsync(errorResponse.ToString());
    }
}