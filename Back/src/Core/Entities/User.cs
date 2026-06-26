using Core.Enums;

namespace Core.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;

    public string Login { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsActive { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiresAt { get; set; }
}
