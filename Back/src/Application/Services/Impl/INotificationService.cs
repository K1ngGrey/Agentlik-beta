using Application.DTOs;
using Application.DTOs.Notifications;
using Core.Enums;

namespace Application.Services.Impl;

public interface INotificationService
{
    Task CreateAsync(Guid userId, NotificationType type, string title, string message,
        Guid? projectId = null, Guid? stageId = null);

    Task<ApiResult<List<NotificationDto>>> GetForUserAsync(Guid userId, bool onlyUnread = false);

    Task<ApiResult<bool>> MarkAsReadAsync(Guid id, Guid userId);

    Task<ApiResult<bool>> MarkAllAsReadAsync(Guid userId);

    Task<ApiResult<int>> GetUnreadCountAsync(Guid userId);
}
