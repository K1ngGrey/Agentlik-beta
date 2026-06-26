using Application.DTOs;
using Application.DTOs.Chat;
using Application.Services.Impl;
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
        {
            return ToActionResult(ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

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
        {
            return ToActionResult(ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi aniqlanmadi."], 401));
        }

        var result = await _chatService.SendProjectMessageAsync(projectId, userId.Value, request.Content);

        return ToActionResult(result);
    }
}
