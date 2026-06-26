using Core.Enums;

namespace Application.DTOs.Stages;

public class StageDto
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Order { get; set; }

    public StageStatus Status { get; set; }

    public int Progress { get; set; }

    public string? Owner { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public List<StageEventDto> Events { get; set; } = [];
}
