using System.Security.Claims;
using Application.DTOs;
using Application.DTOs.Auth;
using Application.DTOs.Users;
using Application.Helpers;
using Application.Services.Impl;
using Core.Entities;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Application.Services;

public class AuthService : IAuthService
{
    private readonly DatabaseContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        DatabaseContext context,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<ApiResult<LoginResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Login == request.Login);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return ApiResult<LoginResponse>.Failure(["Login yoki parol noto'g'ri."], 401);
        }

        if (!user.IsActive)
        {
            return ApiResult<LoginResponse>.Failure(["Foydalanuvchi faol emas."], 403);
        }

        var response = await IssueTokensAsync(user);

        return ApiResult<LoginResponse>.Success(response);
    }

    public async Task<ApiResult<LoginResponse>> RefreshAsync(RefreshTokenRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user is null ||
            user.RefreshTokenExpiresAt is null ||
            user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            return ApiResult<LoginResponse>.Failure(["Refresh token yaroqsiz yoki muddati o'tgan."], 401);
        }

        if (!user.IsActive)
        {
            return ApiResult<LoginResponse>.Failure(["Foydalanuvchi faol emas."], 403);
        }

        var response = await IssueTokensAsync(user);

        return ApiResult<LoginResponse>.Success(response);
    }

    public async Task<ApiResult<bool>> LogoutAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            return ApiResult<bool>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    private async Task<LoginResponse> IssueTokensAsync(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDays);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes),
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Login = user.Login,
                Role = user.Role,
                IsActive = user.IsActive
            }
        };
    }
}
