namespace Application.DTOs.Chat;

public class UnreadCountsDto
{
    public int GlobalChatCount { get; set; }

    public Dictionary<Guid, int> ProjectChatCounts { get; set; } = new();
}
