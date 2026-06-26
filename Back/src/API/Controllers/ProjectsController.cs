using Application.DTOs;
using Application.DTOs.Projects;
using Application.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/projects")]
public class ProjectsController : ApiControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ICurrentUserService _currentUserService;

    public ProjectsController(IProjectService projectService, ICurrentUserService currentUserService)
    {
        _projectService = projectService;
        _currentUserService = currentUserService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _projectService.GetAllAsync();

        return ToActionResult(result);
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _projectService.GetByIdAsync(id);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var userId = _currentUserService.UserId;

        if (userId is null)
        {
            return ToActionResult(ApiResult<ProjectDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

        var result = await _projectService.CreateAsync(request, userId.Value);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var result = await _projectService.UpdateAsync(id, request);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _projectService.DeleteAsync(id);

        return ToActionResult(result);
    }

    [Authorize]
    [HttpGet("{projectId:guid}/members")]
    public async Task<IActionResult> GetMembers(Guid projectId)
    {
        var result = await _projectService.GetMembersAsync(projectId);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPost("{projectId:guid}/members")]
    public async Task<IActionResult> AddMember(Guid projectId, [FromBody] AddProjectMemberRequest request)
    {
        var result = await _projectService.AddMemberAsync(projectId, request.UserId);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpDelete("{projectId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid projectId, Guid userId)
    {
        var result = await _projectService.RemoveMemberAsync(projectId, userId);

        return ToActionResult(result);
    }
}
