using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Persistence;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<ProjectStage> ProjectStages => Set<ProjectStage>();

    public DbSet<StageEvent> StageEvents => Set<StageEvent>();

    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();

    public DbSet<Chat> Chats => Set<Chat>();

    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    public DbSet<ChatReadReceipt> ChatReadReceipts => Set<ChatReadReceipt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DatabaseContext).Assembly);
    }
}
