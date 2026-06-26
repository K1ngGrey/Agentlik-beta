using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class ProjectMemberConfiguration : IEntityTypeConfiguration<ProjectMember>
{
    public void Configure(EntityTypeBuilder<ProjectMember> builder)
    {
        builder.ToTable("ProjectMembers");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.ProjectId)
            .IsRequired();

        builder.Property(m => m.UserId)
            .IsRequired();

        builder.HasIndex(m => new { m.ProjectId, m.UserId })
            .IsUnique();
    }
}
