using Core.Enums;

namespace Core.Entities;

public class Chat : BaseEntity
{
    public ChatType Type { get; set; }

    public Guid? ProjectId { get; set; }
}
