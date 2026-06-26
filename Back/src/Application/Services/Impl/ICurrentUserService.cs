using Core.Enums;

namespace Application.Services.Impl;

public interface ICurrentUserService
{
    Guid? UserId { get; }

    UserRole? Role { get; }
}
