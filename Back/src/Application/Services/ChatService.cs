using Application.DTOs;
using Application.DTOs.Chat;
using Application.Services.Impl;
using Core.Entities;
using Core.Enums;
using DataAccess.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class ChatService : IChatService
{
    private readonly DatabaseContext _context;

    public ChatService(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<ApiResult<ChatMessageDto>> SendProjectMessageAsync(Guid projectId, Guid senderId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return ApiResult<ChatMessageDto>.Failure(["Xabar bo'sh bo'lishi mumkin emas."], 400);
        }

        var chat = await _context.Chats
            .FirstOrDefaultAsync(c => c.Type == ChatType.Project && c.ProjectId == projectId);

        if (chat is null)
        {
            return ApiResult<ChatMessageDto>.Failure(["Loyiha chati topilmadi."], 404);
        }

        return await SaveMessageAsync(chat.Id, senderId, content);
    }

    public async Task<ApiResult<ChatMessageDto>> SendGlobalMessageAsync(Guid senderId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return ApiResult<ChatMessageDto>.Failure(["Xabar bo'sh bo'lishi mumkin emas."], 400);
        }

        var chat = await GetOrCreateGlobalChatAsync();

        return await SaveMessageAsync(chat.Id, senderId, content);
    }

    public async Task<ApiResult<List<ChatMessageDto>>> GetProjectMessagesAsync(Guid projectId)
    {
        var chat = await _context.Chats
            .FirstOrDefaultAsync(c => c.Type == ChatType.Project && c.ProjectId == projectId);

        if (chat is null)
        {
            return ApiResult<List<ChatMessageDto>>.Failure(["Loyiha chati topilmadi."], 404);
        }

        var messages = await GetMessagesAsync(chat.Id);

        return ApiResult<List<ChatMessageDto>>.Success(messages);
    }

    public async Task<ApiResult<List<ChatMessageDto>>> GetGlobalMessagesAsync()
    {
        var chat = await GetOrCreateGlobalChatAsync();

        var messages = await GetMessagesAsync(chat.Id);

        return ApiResult<List<ChatMessageDto>>.Success(messages);
    }

    private async Task<ApiResult<ChatMessageDto>> SaveMessageAsync(Guid chatId, Guid senderId, string content)
    {
        var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == senderId);

        if (sender is null)
        {
            return ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi topilmadi."], 404);
        }

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ChatId = chatId,
            SenderId = senderId,
            Content = content,
            SentAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);

        await _context.SaveChangesAsync();

        var dto = new ChatMessageDto
        {
            Id = message.Id,
            ChatId = message.ChatId,
            SenderId = message.SenderId,
            SenderName = sender.FullName,
            Content = message.Content,
            SentAt = message.SentAt
        };

        return ApiResult<ChatMessageDto>.Success(dto, 201);
    }

    private async Task<List<ChatMessageDto>> GetMessagesAsync(Guid chatId)
    {
        return await _context.ChatMessages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.SentAt)
            .Join(
                _context.Users,
                m => m.SenderId,
                u => u.Id,
                (m, u) => new ChatMessageDto
                {
                    Id = m.Id,
                    ChatId = m.ChatId,
                    SenderId = m.SenderId,
                    SenderName = u.FullName,
                    Content = m.Content,
                    SentAt = m.SentAt
                })
            .ToListAsync();
    }

    private async Task<Chat> GetOrCreateGlobalChatAsync()
    {
        var chat = await _context.Chats.FirstOrDefaultAsync(c => c.Type == ChatType.Global);

        if (chat is null)
        {
            chat = new Chat
            {
                Id = Guid.NewGuid(),
                Type = ChatType.Global,
                ProjectId = null,
                CreatedAt = DateTime.UtcNow
            };

            _context.Chats.Add(chat);

            await _context.SaveChangesAsync();
        }

        return chat;
    }
}
