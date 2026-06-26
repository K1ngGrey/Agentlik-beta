using Application.DTOs;
using Application.DTOs.Auth;

namespace Application.Services.Impl;

public interface IAuthService
{
    Task<ApiResult<LoginResponse>> LoginAsync(LoginRequest request);

    Task<ApiResult<LoginResponse>> RefreshAsync(RefreshTokenRequest request);

    Task<ApiResult<bool>> LogoutAsync(Guid userId);
}
