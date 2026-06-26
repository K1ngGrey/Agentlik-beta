namespace Application.DTOs.Stages;

public class StageEventDto
{
    public Guid Id { get; set; }

    public DateTime Date { get; set; }

    public string Text { get; set; } = string.Empty;
}