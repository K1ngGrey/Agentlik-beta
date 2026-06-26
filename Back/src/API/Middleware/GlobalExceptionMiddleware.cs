using System.Text.Json;
using Application.DTOs;

namespace API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
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
            _logger.LogError(ex, "Handle qilinmagan xatolik yuz berdi.");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 500;

            var result = ApiResult<object>.Failure(["Serverda kutilmagan xatolik yuz berdi."], 500);

            var json = JsonSerializer.Serialize(result, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}
