using Application.DTOs;
using Application.DTOs.Users;
using Application.Services.Impl;
using Core.Entities;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class ProfileService : IProfileService
{
    private readonly DatabaseContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ProfileService(DatabaseContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<ApiResult<UserDto>> GetProfileAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            return ApiResult<UserDto>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        return ApiResult<UserDto>.Success(MapToDto(user));
    }

    public async Task<ApiResult<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResult<UserDto>.Failure(["F.I.Sh bo'sh bo'lishi mumkin emas."], 400);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            return ApiResult<UserDto>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        user.FullName = request.FullName;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResult<UserDto>.Success(MapToDto(user));
    }

    public async Task<ApiResult<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return ApiResult<bool>.Failure(["Yangi parol bo'sh bo'lishi mumkin emas."], 400);
        }

        if (request.NewPassword.Length < 6)
        {
            return ApiResult<bool>.Failure(["Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak."], 400);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
        {
            return ApiResult<bool>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return ApiResult<bool>.Failure(["Joriy parol noto'g'ri."], 400);
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Login = user.Login,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }
}
