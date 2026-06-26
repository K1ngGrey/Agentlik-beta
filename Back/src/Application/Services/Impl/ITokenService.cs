using System.Security.Claims;
using Core.Entities;

namespace Application.Services.Impl;

public interface ITokenService
{
    string GenerateAccessToken(User user);

    string GenerateRefreshToken();

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
