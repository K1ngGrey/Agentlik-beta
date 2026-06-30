namespace Core.Entities;

public class ChatMessage : BaseEntity
{
    public Guid ChatId { get; set; }

    public Guid SenderId { get; set; }

    public User Sender { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }

    public bool IsPinned { get; set; }

    public bool IsEdited { get; set; }

    public DateTime? EditedAt { get; set; }
}
