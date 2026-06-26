using Core.Enums;

namespace Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Client { get; set; }

    public DateTime? Deadline { get; set; }

    public ProjectStatus Status { get; set; }

    public Guid CreatedById { get; set; }

    public ICollection<ProjectStage> Stages { get; set; } = new List<ProjectStage>();
}
