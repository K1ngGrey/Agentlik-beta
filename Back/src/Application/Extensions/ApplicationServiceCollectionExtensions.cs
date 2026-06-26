using Application.Services;
using Application.Services.Impl;
using Microsoft.Extensions.DependencyInjection;

namespace Application.Extensions;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();

        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDataSeeder, DataSeeder>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IStageService, StageService>();
        services.AddScoped<IChatService, ChatService>();

        return services;
    }
}
