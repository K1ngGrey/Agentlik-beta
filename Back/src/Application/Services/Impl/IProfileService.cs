using Application.DTOs;
using Application.DTOs.Users;

namespace Application.Services.Impl;

public interface IProfileService
{
    Task<ApiResult<UserDto>> GetProfileAsync(Guid userId);

    Task<ApiResult<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);

    Task<ApiResult<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}
