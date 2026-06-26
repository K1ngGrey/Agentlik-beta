using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class ProjectStageConfiguration : IEntityTypeConfiguration<ProjectStage>
{
    public void Configure(EntityTypeBuilder<ProjectStage> builder)
    {
        builder.ToTable("ProjectStages");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.ProjectId)
            .IsRequired();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(s => s.Description)
            .HasMaxLength(2000);

        builder.Property(s => s.Order)
            .IsRequired();

        builder.Property(s => s.Status)
            .IsRequired();

        builder.Property(s => s.Progress)
            .IsRequired();
    }
}
