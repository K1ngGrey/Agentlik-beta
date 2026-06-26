namespace Application.DTOs.Projects;

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Client { get; set; }

    public DateTime? Deadline { get; set; }
}
