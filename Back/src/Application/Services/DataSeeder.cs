using Application.Services.Impl;
using Core.Entities;
using Core.Enums;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Application.Services;

public class DataSeeder : IDataSeeder
{
    private readonly DatabaseContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public DataSeeder(
        DatabaseContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task SeedAsync()
    {
        await SeedSuperAdminAsync();
        await SeedGlobalChatAsync();

        await _context.SaveChangesAsync();
    }

    private async Task SeedSuperAdminAsync()
    {
        var exists = await _context.Users.AnyAsync(u => u.Role == UserRole.SuperAdmin);

        if (exists)
        {
            return;
        }

        var section = _configuration.GetSection("SeedAdmin");
        var login = section["Login"] ?? string.Empty;
        var password = section["Password"] ?? string.Empty;
        var fullName = section["FullName"] ?? string.Empty;

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Login = login,
            PasswordHash = _passwordHasher.Hash(password),
            Role = UserRole.SuperAdmin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(admin);
    }

    private async Task SeedGlobalChatAsync()
    {
        var exists = await _context.Chats.AnyAsync(c => c.Type == ChatType.Global);

        if (exists)
        {
            return;
        }

        var globalChat = new Chat
        {
            Id = Guid.NewGuid(),
            Type = ChatType.Global,
            ProjectId = null,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Chats.AddAsync(globalChat);
    }
}
