using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class ChatConfiguration : IEntityTypeConfiguration<Chat>
{
    public void Configure(EntityTypeBuilder<Chat> builder)
    {
        builder.ToTable("Chats");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Type)
            .IsRequired();

        builder.HasMany<ChatMessage>()
            .WithOne()
            .HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
