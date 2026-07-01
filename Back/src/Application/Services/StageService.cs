using Application.DTOs;
using Application.DTOs.Stages;
using Application.Services.Impl;
using Core.Entities;
using Core.Enums;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class StageService : IStageService
{
    private readonly DatabaseContext _context;

    public StageService(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<ApiResult<StageDto>> CreateAsync(Guid projectId, CreateStageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return ApiResult<StageDto>.Failure(["Bosqich nomi bo'sh bo'lishi mumkin emas."], 400);
        }

        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);

        if (!projectExists)
        {
            return ApiResult<StageDto>.Failure(["Loyiha topilmadi."], 404);
        }

        var stage = new ProjectStage
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = request.Name,
            Description = request.Description,
            Order = request.Order,
            Status = StageStatus.NotStarted,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProjectStages.Add(stage);

        await _context.SaveChangesAsync();

        return ApiResult<StageDto>.Success(MapToDto(stage), 201);
    }

    public async Task<ApiResult<StageDto>> UpdateAsync(Guid id, UpdateStageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return ApiResult<StageDto>.Failure(["Bosqich nomi bo'sh bo'lishi mumkin emas."], 400);
        }

        var stage = await _context.ProjectStages
            .Include(s => s.Events)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (stage is null)
        {
            return ApiResult<StageDto>.Failure(["Bosqich topilmadi."], 404);
        }

        var oldProgress = stage.Progress;
        var newProgress = Math.Clamp(request.Progress, 0, 100);

        stage.Name = request.Name;
        stage.Description = request.Description;
        stage.Order = request.Order;
        stage.Progress = newProgress;
        stage.Owner = request.Owner;
        stage.UpdatedAt = DateTime.UtcNow;

        if (oldProgress != newProgress)
        {
            _context.StageEvents.Add(new StageEvent
            {
                Id = Guid.NewGuid(),
                StageId = stage.Id,
                Date = DateTime.UtcNow,
                Text = $"Taraqqiyot yangilandi: {oldProgress}% → {newProgress}%",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return ApiResult<StageDto>.Success(MapToDto(stage));
    }

    public async Task<ApiResult<bool>> DeleteAsync(Guid id)
    {
        var stage = await _context.ProjectStages.FirstOrDefaultAsync(s => s.Id == id);

        if (stage is null)
        {
            return ApiResult<bool>.Failure(["Bosqich topilmadi."], 404);
        }

        _context.ProjectStages.Remove(stage);

        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<StageDto>> UpdateStatusAsync(Guid id, UpdateStageStatusRequest request)
    {
        var stage = await _context.ProjectStages
            .Include(s => s.Events)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (stage is null)
        {
            return ApiResult<StageDto>.Failure(["Bosqich topilmadi."], 404);
        }

        var oldStatus = stage.Status;

        stage.Status = request.Status;

        if (request.Status == StageStatus.InProgress && stage.StartDate is null)
        {
            stage.StartDate = DateTime.UtcNow;
        }

        if (request.Status == StageStatus.Completed)
        {
            stage.StartDate ??= DateTime.UtcNow;
            stage.EndDate = DateTime.UtcNow;
            stage.Progress = 100;
        }
        else
        {
            stage.EndDate = null;
        }

        if (request.Status == StageStatus.NotStarted)
        {
            stage.Progress = 0;
        }

        stage.UpdatedAt = DateTime.UtcNow;

        if (oldStatus != request.Status)
        {
            _context.StageEvents.Add(new StageEvent
            {
                Id = Guid.NewGuid(),
                StageId = stage.Id,
                Date = DateTime.UtcNow,
                Text = $"Holat o'zgartirildi: {StatusLabel(oldStatus)} → {StatusLabel(request.Status)}",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return ApiResult<StageDto>.Success(MapToDto(stage));
    }

    private static string StatusLabel(StageStatus status) => status switch
    {
        StageStatus.NotStarted => "Rejalashtirilgan",
        StageStatus.InProgress => "Jarayonda",
        StageStatus.Completed  => "Tugallangan",
        StageStatus.Blocked    => "To'xtatilgan",
        _                      => status.ToString()
    };

    public async Task<ApiResult<List<StageDto>>> GetByProjectAsync(Guid projectId)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);

        if (!projectExists)
        {
            return ApiResult<List<StageDto>>.Failure(["Loyiha topilmadi."], 404);
        }

        var stages = await _context.ProjectStages
            .Where(s => s.ProjectId == projectId)
            .Include(s => s.Events)
            .OrderBy(s => s.Order)
            .Select(s => new StageDto
            {
                Id = s.Id,
                ProjectId = s.ProjectId,
                Name = s.Name,
                Description = s.Description,
                Order = s.Order,
                Status = s.Status,
                Progress = s.Progress,
                Owner = s.Owner,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Events = s.Events
                    .OrderByDescending(e => e.Date)
                    .Select(e => new StageEventDto
                    {
                        Id = e.Id,
                        Date = e.Date,
                        Text = e.Text
                    })
                    .ToList()
            })
            .ToListAsync();

        return ApiResult<List<StageDto>>.Success(stages);
    }

    public async Task<ApiResult<StageEventDto>> AddEventAsync(Guid stageId, AddStageEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return ApiResult<StageEventDto>.Failure(["Voqea matni bo'sh bo'lishi mumkin emas."], 400);
        }

        var stage = await _context.ProjectStages.FirstOrDefaultAsync(s => s.Id == stageId);

        if (stage is null)
        {
            return ApiResult<StageEventDto>.Failure(["Bosqich topilmadi."], 404);
        }

        var stageEvent = new StageEvent
        {
            Id = Guid.NewGuid(),
            StageId = stage.Id,
            Date = request.Date ?? DateTime.UtcNow,
            Text = request.Text,
            CreatedAt = DateTime.UtcNow
        };

        _context.StageEvents.Add(stageEvent);

        await _context.SaveChangesAsync();

        var dto = new StageEventDto
        {
            Id = stageEvent.Id,
            Date = stageEvent.Date,
            Text = stageEvent.Text
        };

        return ApiResult<StageEventDto>.Success(dto, 201);
    }

    private static StageDto MapToDto(ProjectStage stage)
    {
        return new StageDto
        {
            Id = stage.Id,
            ProjectId = stage.ProjectId,
            Name = stage.Name,
            Description = stage.Description,
            Order = stage.Order,
            Status = stage.Status,
            Progress = stage.Progress,
            Owner = stage.Owner,
            StartDate = stage.StartDate,
            EndDate = stage.EndDate,
            Events = stage.Events
                .OrderByDescending(e => e.Date)
                .Select(e => new StageEventDto
                {
                    Id = e.Id,
                    Date = e.Date,
                    Text = e.Text
                })
                .ToList()
        };
    }
}
