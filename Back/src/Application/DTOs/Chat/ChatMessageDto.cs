namespace Application.DTOs.Chat;

public class ChatMessageDto
{
    public Guid Id { get; set; }

    public Guid ChatId { get; set; }

    public Guid SenderId { get; set; }

    public string SenderName { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }

    public bool IsPinned { get; set; }

    public bool IsEdited { get; set; }

    public DateTime? EditedAt { get; set; }
}
