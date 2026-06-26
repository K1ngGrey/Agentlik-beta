using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class StageEventConfiguration : IEntityTypeConfiguration<StageEvent>
{
    public void Configure(EntityTypeBuilder<StageEvent> builder)
    {
        builder.ToTable("StageEvents");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.StageId)
            .IsRequired();

        builder.Property(e => e.Text)
            .IsRequired()
            .HasMaxLength(2000);

        builder.HasOne(e => e.Stage)
            .WithMany(s => s.Events)
            .HasForeignKey(e => e.StageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}