using Application.DTOs;
using Application.DTOs.Chat;

namespace Application.Services.Impl;

public interface IChatService
{
    Task<ApiResult<ChatMessageDto>> SendProjectMessageAsync(Guid projectId, Guid senderId, string content);

    Task<ApiResult<ChatMessageDto>> SendGlobalMessageAsync(Guid senderId, string content);

    Task<ApiResult<List<ChatMessageDto>>> GetProjectMessagesAsync(Guid projectId);

    Task<ApiResult<List<ChatMessageDto>>> GetGlobalMessagesAsync();

    Task<ApiResult<ChatMessageDto>> EditMessageAsync(Guid messageId, Guid requesterId, string newContent);

    Task<ApiResult<bool>> DeleteMessageAsync(Guid messageId, Guid requesterId, bool isSuperAdmin);

    Task<ApiResult<ChatMessageDto>> TogglePinAsync(Guid messageId, Guid requesterId, bool isSuperAdmin);
}
