using Core.Enums;

namespace Core.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }

    public NotificationType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public Guid? RelatedProjectId { get; set; }

    public Guid? RelatedStageId { get; set; }
}
