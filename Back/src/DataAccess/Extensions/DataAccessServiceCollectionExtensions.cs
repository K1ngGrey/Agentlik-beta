using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DataAccess.Extensions;

public static class DataAccessServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccess(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<DatabaseContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        return services;
    }
}
