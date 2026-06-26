using Application.DTOs.Stages;
using Application.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/projects/{projectId:guid}/stages")]
public class StagesController : ApiControllerBase
{
    private readonly IStageService _stageService;

    public StagesController(IStageService stageService)
    {
        _stageService = stageService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetByProject(Guid projectId)
    {
        var result = await _stageService.GetByProjectAsync(projectId);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateStageRequest request)
    {
        var result = await _stageService.CreateAsync(projectId, request);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid projectId, Guid id, [FromBody] UpdateStageRequest request)
    {
        var result = await _stageService.UpdateAsync(id, request);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid projectId, Guid id)
    {
        var result = await _stageService.DeleteAsync(id);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid projectId, Guid id, [FromBody] UpdateStageStatusRequest request)
    {
        var result = await _stageService.UpdateStatusAsync(id, request);

        return ToActionResult(result);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPost("{id:guid}/events")]
    public async Task<IActionResult> AddEvent(Guid projectId, Guid id, [FromBody] AddStageEventRequest request)
    {
        var result = await _stageService.AddEventAsync(id, request);

        return ToActionResult(result);
    }
}
