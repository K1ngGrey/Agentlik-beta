using Core.Enums;

namespace Application.DTOs.Users;

public class UserDto
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Login { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsActive { get; set; }
}
