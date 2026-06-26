using Core.Enums;

namespace Application.DTOs.Projects;

public class ProjectDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Client { get; set; }

    public DateTime? Deadline { get; set; }

    public ProjectStatus Status { get; set; }

    public int StagesCount { get; set; }

    public DateTime CreatedAt { get; set; }
}
