using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(n => n.IsRead)
            .HasDefaultValue(false);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(n => new { n.UserId, n.IsRead });
    }
}
