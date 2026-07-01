namespace Core.Entities;

public class ChatReadReceipt
{
    public Guid UserId { get; set; }

    public Guid ChatId { get; set; }

    public DateTime LastReadAt { get; set; }
}
