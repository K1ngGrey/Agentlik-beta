using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Services.Impl;
using Core.Entities;
using Core.Enums;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class NotificationService : INotificationService
{
    private readonly DatabaseContext _context;

    public NotificationService(DatabaseContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(Guid userId, NotificationType type, string title, string message,
        Guid? projectId = null, Guid? stageId = null)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            IsRead = false,
            RelatedProjectId = projectId,
            RelatedStageId = stageId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResult<List<NotificationDto>>> GetForUserAsync(Guid userId, bool onlyUnread = false)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (onlyUnread)
            query = query.Where(n => !n.IsRead);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                RelatedProjectId = n.RelatedProjectId,
                RelatedStageId = n.RelatedStageId,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return ApiResult<List<NotificationDto>>.Success(items);
    }

    public async Task<ApiResult<bool>> MarkAsReadAsync(Guid id, Guid userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification is null)
            return ApiResult<bool>.Failure(["Bildirishnoma topilmadi."], 404);

        notification.IsRead = true;
        notification.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<bool>> MarkAllAsReadAsync(Guid userId)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsRead, true)
                .SetProperty(n => n.UpdatedAt, DateTime.UtcNow));

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<int>> GetUnreadCountAsync(Guid userId)
    {
        var count = await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);

        return ApiResult<int>.Success(count);
    }
}
