using Application.DTOs;
using Application.DTOs.Chat;
using Application.Services.Impl;
using Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class ChatController : ApiControllerBase
{
    private readonly IChatService _chatService;
    private readonly ICurrentUserService _currentUserService;

    public ChatController(IChatService chatService, ICurrentUserService currentUserService)
    {
        _chatService = chatService;
        _currentUserService = currentUserService;
    }

    [HttpGet("api/chats/global")]
    public async Task<IActionResult> GetGlobalMessages()
    {
        var result = await _chatService.GetGlobalMessagesAsync();
        return ToActionResult(result);
    }

    [HttpPost("api/chats/global/messages")]
    public async Task<IActionResult> SendGlobalMessage([FromBody] SendMessageRequest request)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _chatService.SendGlobalMessageAsync(userId.Value, request.Content);
        return ToActionResult(result);
    }

    [HttpGet("api/projects/{projectId:guid}/chat")]
    public async Task<IActionResult> GetProjectMessages(Guid projectId)
    {
        var result = await _chatService.GetProjectMessagesAsync(projectId);
        return ToActionResult(result);
    }

    [HttpPost("api/projects/{projectId:guid}/chat/messages")]
    public async Task<IActionResult> SendProjectMessage(Guid projectId, [FromBody] SendMessageRequest request)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _chatService.SendProjectMessageAsync(projectId, userId.Value, request.Content);
        return ToActionResult(result);
    }

    [HttpPut("api/messages/{messageId:guid}")]
    public async Task<IActionResult> EditMessage(Guid messageId, [FromBody] EditMessageRequest request)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _chatService.EditMessageAsync(messageId, userId.Value, request.Content);
        return ToActionResult(result);
    }

    [HttpDelete("api/messages/{messageId:guid}")]
    public async Task<IActionResult> DeleteMessage(Guid messageId)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<bool>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var isSuperAdmin = _currentUserService.Role == UserRole.SuperAdmin;
        var result = await _chatService.DeleteMessageAsync(messageId, userId.Value, isSuperAdmin);
        return ToActionResult(result);
    }

    [HttpPatch("api/messages/{messageId:guid}/pin")]
    public async Task<IActionResult> TogglePin(Guid messageId)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var isSuperAdmin = _currentUserService.Role == UserRole.SuperAdmin;
        var result = await _chatService.TogglePinAsync(messageId, userId.Value, isSuperAdmin);
        return ToActionResult(result);
    }

    [HttpPost("api/chats/{chatId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid chatId)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<bool>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _chatService.MarkChatAsReadAsync(chatId, userId.Value);
        return ToActionResult(result);
    }

    [HttpGet("api/chats/unread-counts")]
    public async Task<IActionResult> GetUnreadCounts()
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
            return ToActionResult(ApiResult<UnreadCountsDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));

        var result = await _chatService.GetUnreadCountsAsync(userId.Value);
        return ToActionResult(result);
    }
}
