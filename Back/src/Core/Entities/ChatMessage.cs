namespace Core.Entities;

public class ChatMessage : BaseEntity
{
    public Guid ChatId { get; set; }

    public Guid SenderId { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}
