namespace Application.DTOs.Stages;

public class AddStageEventRequest
{
    public DateTime? Date { get; set; }

    public string Text { get; set; } = string.Empty;
}