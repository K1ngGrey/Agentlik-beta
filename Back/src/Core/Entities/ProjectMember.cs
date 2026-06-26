namespace Core.Entities;

public class ProjectMember : BaseEntity
{
    public Guid ProjectId { get; set; }

    public Guid UserId { get; set; }
}
