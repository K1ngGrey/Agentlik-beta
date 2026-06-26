using Application.DTOs;
using Application.DTOs.Users;

namespace Application.Services.Impl;

public interface IUserService
{
    Task<ApiResult<List<UserDto>>> GetAllAsync();

    Task<ApiResult<UserDto>> GetByIdAsync(Guid id);

    Task<ApiResult<UserDto>> CreateAsync(CreateUserRequest request);

    Task<ApiResult<UserDto>> UpdateAsync(Guid id, UpdateUserRequest request);

    Task<ApiResult<bool>> DeleteAsync(Guid id);
}
