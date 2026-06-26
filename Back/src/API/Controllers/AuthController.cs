using Application.DTOs;
using Application.DTOs.Auth;
using Application.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAuthService authService, ICurrentUserService currentUserService)
    {
        _authService = authService;
        _currentUserService = currentUserService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        return ToActionResult(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshAsync(request);

        return ToActionResult(result);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = _currentUserService.UserId;

        if (userId is null)
        {
            return ToActionResult(ApiResult<bool>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

        var result = await _authService.LogoutAsync(userId.Value);

        return ToActionResult(result);
    }
}
