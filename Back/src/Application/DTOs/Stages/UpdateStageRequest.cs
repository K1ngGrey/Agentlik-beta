namespace Application.DTOs.Stages;

public class UpdateStageRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Order { get; set; }

    public int Progress { get; set; }

    public string? Owner { get; set; }
}
