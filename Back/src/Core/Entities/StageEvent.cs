namespace Core.Entities;

public class StageEvent : BaseEntity
{
    public Guid StageId { get; set; }

    public DateTime Date { get; set; }

    public string Text { get; set; } = string.Empty;

    public ProjectStage Stage { get; set; } = null!;
}
