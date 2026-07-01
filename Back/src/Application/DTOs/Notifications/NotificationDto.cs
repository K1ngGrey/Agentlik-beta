using Core.Enums;

namespace Application.DTOs.Notifications;

public class NotificationDto
{
    public Guid Id { get; set; }

    public NotificationType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public Guid? RelatedProjectId { get; set; }

    public Guid? RelatedStageId { get; set; }

    public DateTime CreatedAt { get; set; }
}
