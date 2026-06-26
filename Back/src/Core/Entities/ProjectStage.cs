using Core.Enums;

namespace Core.Entities;

public class ProjectStage : BaseEntity
{
    public Guid ProjectId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Order { get; set; }

    public StageStatus Status { get; set; }

    public int Progress { get; set; }

    public string? Owner { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public Project Project { get; set; } = null!;

    public ICollection<StageEvent> Events { get; set; } = new List<StageEvent>();
}
