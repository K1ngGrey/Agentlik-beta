using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Services.Impl;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class NotificationsController : ApiControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(INotificationService notificationService, ICurrentUserService currentUserService)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    [HttpGet("api/notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] bool onlyUnread = false)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<List<NotificationDto>>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _notificationService.GetForUserAsync(userId.Value, onlyUnread);
        return ToActionResult(result);
    }

    [HttpGet("api/notifications/unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<int>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _notificationService.GetUnreadCountAsync(userId.Value);
        return ToActionResult(result);
    }

    [HttpPost("api/notifications/{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<bool>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _notificationService.MarkAsReadAsync(id, userId.Value);
        return ToActionResult(result);
    }

    [HttpPost("api/notifications/read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<bool>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _notificationService.MarkAllAsReadAsync(userId.Value);
        return ToActionResult(result);
    }
}
