using Application.DTOs;
using Application.DTOs.Projects;

namespace Application.Services.Impl;

public interface IProjectService
{
    Task<ApiResult<ProjectDto>> CreateAsync(CreateProjectRequest request, Guid createdById);

    Task<ApiResult<ProjectDto>> UpdateAsync(Guid id, UpdateProjectRequest request);

    Task<ApiResult<bool>> DeleteAsync(Guid id);

    Task<ApiResult<ProjectDetailDto>> GetByIdAsync(Guid id);

    Task<ApiResult<List<ProjectDto>>> GetAllAsync();

    Task<ApiResult<List<ProjectMemberDto>>> GetMembersAsync(Guid projectId);

    Task<ApiResult<ProjectMemberDto>> AddMemberAsync(Guid projectId, Guid userId);

    Task<ApiResult<bool>> RemoveMemberAsync(Guid projectId, Guid userId);
}
