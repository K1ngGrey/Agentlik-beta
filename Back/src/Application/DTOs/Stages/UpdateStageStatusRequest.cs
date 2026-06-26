using Core.Enums;

namespace Application.DTOs.Stages;

public class UpdateStageStatusRequest
{
    public StageStatus Status { get; set; }
}
