using Application.DTOs;
using Application.DTOs.Stages;

namespace Application.Services.Impl;

public interface IStageService
{
    Task<ApiResult<StageDto>> CreateAsync(Guid projectId, CreateStageRequest request);

    Task<ApiResult<StageDto>> UpdateAsync(Guid id, UpdateStageRequest request);

    Task<ApiResult<bool>> DeleteAsync(Guid id);

    Task<ApiResult<StageDto>> UpdateStatusAsync(Guid id, UpdateStageStatusRequest request);

    Task<ApiResult<List<StageDto>>> GetByProjectAsync(Guid projectId);

    Task<ApiResult<StageEventDto>> AddEventAsync(Guid stageId, AddStageEventRequest request);
}
