using Application.DTOs.Stages;

namespace Application.DTOs.Projects;

public class ProjectDetailDto : ProjectDto
{
    public List<StageDto> Stages { get; set; } = [];

    public List<ProjectMemberDto> Members { get; set; } = [];
}
