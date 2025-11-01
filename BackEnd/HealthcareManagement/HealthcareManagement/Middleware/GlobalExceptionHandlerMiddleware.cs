using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace HealthcareManagement.Middleware
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var code = HttpStatusCode.InternalServerError;
            var message = "An error occurred while processing your request.";

            // Handle specific exception types
            switch (exception)
            {
                case ArgumentException argEx:
                    code = HttpStatusCode.BadRequest;
                    message = argEx.Message;
                    break;
                case UnauthorizedAccessException:
                    code = HttpStatusCode.Unauthorized;
                    message = "You are not authorized to perform this action.";
                    break;
                case KeyNotFoundException:
                    code = HttpStatusCode.NotFound;
                    message = "The requested resource was not found.";
                    break;
                case InvalidOperationException invalidOpEx:
                    code = HttpStatusCode.BadRequest;
                    message = invalidOpEx.Message;
                    break;
                default:
                    // For other exceptions, use the exception message if available
                    if (!string.IsNullOrWhiteSpace(exception.Message))
                    {
                        message = exception.Message;
                    }
                    break;
            }

            var result = JsonSerializer.Serialize(new { message, error = exception.GetType().Name });
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)code;
            return context.Response.WriteAsync(result);
        }
    }
}

