using Core.Enums;

namespace Application.DTOs.Users;

public class CreateUserRequest
{
    public string FullName { get; set; } = string.Empty;

    public string Login { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; }
}
