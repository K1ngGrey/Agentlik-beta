using System.Security.Claims;
using Application.Services.Impl;
using Core.Enums;
using Microsoft.AspNetCore.Http;

namespace Application.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public UserRole? Role
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

            return Enum.TryParse<UserRole>(value, out var role) ? role : null;
        }
    }
}
