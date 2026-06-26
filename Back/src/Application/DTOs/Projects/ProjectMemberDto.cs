using Core.Enums;

namespace Application.DTOs.Projects;

public class ProjectMemberDto
{
    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Login { get; set; } = string.Empty;

    public UserRole Role { get; set; }
}
