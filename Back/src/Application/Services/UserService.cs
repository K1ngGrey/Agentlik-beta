using Application.DTOs;
using Application.DTOs.Users;
using Application.Services.Impl;
using Core.Entities;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class UserService : IUserService
{
    private readonly DatabaseContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(DatabaseContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<ApiResult<List<UserDto>>> GetAllAsync()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Login = u.Login,
                Role = u.Role,
                IsActive = u.IsActive
            })
            .ToListAsync();

        return ApiResult<List<UserDto>>.Success(users);
    }

    public async Task<ApiResult<UserDto>> GetByIdAsync(Guid id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return ApiResult<UserDto>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        return ApiResult<UserDto>.Success(MapToDto(user));
    }

    public async Task<ApiResult<UserDto>> CreateAsync(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResult<UserDto>.Failure(["F.I.Sh bo'sh bo'lishi mumkin emas."], 400);
        }

        if (string.IsNullOrWhiteSpace(request.Login))
        {
            return ApiResult<UserDto>.Failure(["Login bo'sh bo'lishi mumkin emas."], 400);
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return ApiResult<UserDto>.Failure(["Parol bo'sh bo'lishi mumkin emas."], 400);
        }

        var loginExists = await _context.Users.AnyAsync(u => u.Login == request.Login);

        if (loginExists)
        {
            return ApiResult<UserDto>.Failure(["Bunday login allaqachon mavjud."], 409);
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Login = request.Login,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return ApiResult<UserDto>.Success(MapToDto(user), 201);
    }

    public async Task<ApiResult<UserDto>> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return ApiResult<UserDto>.Failure(["F.I.Sh bo'sh bo'lishi mumkin emas."], 400);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return ApiResult<UserDto>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        user.FullName = request.FullName;
        user.Role = request.Role;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResult<UserDto>.Success(MapToDto(user));
    }

    public async Task<ApiResult<bool>> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return ApiResult<bool>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        _context.Users.Remove(user);

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
