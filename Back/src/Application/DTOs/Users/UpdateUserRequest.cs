using Core.Enums;

namespace Application.DTOs.Users;

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsActive { get; set; }
}
