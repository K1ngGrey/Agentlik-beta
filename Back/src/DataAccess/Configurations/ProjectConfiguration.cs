using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Client)
            .HasMaxLength(300);

        builder.Property(p => p.Status)
            .IsRequired();

        builder.Property(p => p.CreatedById)
            .IsRequired();

        builder.HasMany(p => p.Stages)
            .WithOne(s => s.Project)
            .HasForeignKey(s => s.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
