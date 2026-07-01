using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccess.Configurations;

public class ChatReadReceiptConfiguration : IEntityTypeConfiguration<ChatReadReceipt>
{
    public void Configure(EntityTypeBuilder<ChatReadReceipt> builder)
    {
        builder.ToTable("ChatReadReceipts");

        builder.HasKey(r => new { r.UserId, r.ChatId });

        builder.Property(r => r.LastReadAt)
            .IsRequired();

        builder.HasOne<Chat>()
            .WithMany()
            .HasForeignKey(r => r.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
