using Application.DTOs.Users;

namespace Application.DTOs.Auth;

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime AccessTokenExpiresAt { get; set; }

    public UserDto User { get; set; } = null!;
}
