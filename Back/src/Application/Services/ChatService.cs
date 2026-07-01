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
            return ApiResult<ChatMessageDto>.Failure(["Xabar bo'sh bo'lishi mumkin emas."], 400);

        var chat = await _context.Chats
            .FirstOrDefaultAsync(c => c.Type == ChatType.Project && c.ProjectId == projectId);

        if (chat is null)
            return ApiResult<ChatMessageDto>.Failure(["Loyiha chati topilmadi."], 404);

        return await SaveMessageAsync(chat.Id, senderId, content);
    }

    public async Task<ApiResult<ChatMessageDto>> SendGlobalMessageAsync(Guid senderId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return ApiResult<ChatMessageDto>.Failure(["Xabar bo'sh bo'lishi mumkin emas."], 400);

        var chat = await GetOrCreateGlobalChatAsync();
        return await SaveMessageAsync(chat.Id, senderId, content);
    }

    public async Task<ApiResult<List<ChatMessageDto>>> GetProjectMessagesAsync(Guid projectId)
    {
        var chat = await _context.Chats
            .FirstOrDefaultAsync(c => c.Type == ChatType.Project && c.ProjectId == projectId);

        if (chat is null)
            return ApiResult<List<ChatMessageDto>>.Failure(["Loyiha chati topilmadi."], 404);

        var messages = await GetMessagesAsync(chat.Id);
        return ApiResult<List<ChatMessageDto>>.Success(messages);
    }

    public async Task<ApiResult<List<ChatMessageDto>>> GetGlobalMessagesAsync()
    {
        var chat = await GetOrCreateGlobalChatAsync();
        var messages = await GetMessagesAsync(chat.Id);
        return ApiResult<List<ChatMessageDto>>.Success(messages);
    }

    public async Task<ApiResult<ChatMessageDto>> EditMessageAsync(Guid messageId, Guid requesterId, string newContent)
    {
        if (string.IsNullOrWhiteSpace(newContent))
            return ApiResult<ChatMessageDto>.Failure(["Xabar bo'sh bo'lishi mumkin emas."], 400);

        var message = await _context.ChatMessages
            .Include(m => m.Sender)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message is null)
            return ApiResult<ChatMessageDto>.Failure(["Xabar topilmadi."], 404);

        if (message.SenderId != requesterId)
            return ApiResult<ChatMessageDto>.Failure(["Siz faqat o'z xabarlaringizni tahrirlashingiz mumkin."], 403);

        message.Content = newContent.Trim();
        message.IsEdited = true;
        message.EditedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ApiResult<ChatMessageDto>.Success(ToDto(message));
    }

    public async Task<ApiResult<bool>> DeleteMessageAsync(Guid messageId, Guid requesterId, bool isSuperAdmin)
    {
        var message = await _context.ChatMessages
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message is null)
            return ApiResult<bool>.Failure(["Xabar topilmadi."], 404);

        if (!isSuperAdmin && message.SenderId != requesterId)
            return ApiResult<bool>.Failure(["Siz faqat o'z xabarlaringizni o'chira olasiz."], 403);

        _context.ChatMessages.Remove(message);
        await _context.SaveChangesAsync();

        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<ChatMessageDto>> TogglePinAsync(Guid messageId, Guid requesterId, bool isSuperAdmin)
    {
        var message = await _context.ChatMessages
            .Include(m => m.Sender)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message is null)
            return ApiResult<ChatMessageDto>.Failure(["Xabar topilmadi."], 404);

        if (!isSuperAdmin && message.SenderId != requesterId)
            return ApiResult<ChatMessageDto>.Failure(["Xabarni mahkamlash uchun huquqingiz yo'q."], 403);

        message.IsPinned = !message.IsPinned;
        await _context.SaveChangesAsync();

        return ApiResult<ChatMessageDto>.Success(ToDto(message));
    }

    private async Task<ApiResult<ChatMessageDto>> SaveMessageAsync(Guid chatId, Guid senderId, string content)
    {
        var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == senderId);

        if (sender is null)
            return ApiResult<ChatMessageDto>.Failure(["Foydalanuvchi topilmadi."], 404);

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ChatId = chatId,
            SenderId = senderId,
            Sender = sender,
            Content = content,
            SentAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        return ApiResult<ChatMessageDto>.Success(ToDto(message), 201);
    }

    private async Task<List<ChatMessageDto>> GetMessagesAsync(Guid chatId)
    {
        return await _context.ChatMessages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.SentAt)
            .Include(m => m.Sender)
            .Select(m => new ChatMessageDto
            {
                Id = m.Id,
                ChatId = m.ChatId,
                SenderId = m.SenderId,
                SenderName = m.Sender.FullName,
                Content = m.Content,
                SentAt = m.SentAt,
                IsPinned = m.IsPinned,
                IsEdited = m.IsEdited,
                EditedAt = m.EditedAt,
            })
            .ToListAsync();
    }

    private static ChatMessageDto ToDto(ChatMessage m) => new()
    {
        Id = m.Id,
        ChatId = m.ChatId,
        SenderId = m.SenderId,
        SenderName = m.Sender?.FullName ?? string.Empty,
        Content = m.Content,
        SentAt = m.SentAt,
        IsPinned = m.IsPinned,
        IsEdited = m.IsEdited,
        EditedAt = m.EditedAt,
    };

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

    public async Task<ApiResult<bool>> MarkChatAsReadAsync(Guid chatId, Guid userId)
    {
        var chat = await _context.Chats.FirstOrDefaultAsync(c => c.Id == chatId);
        if (chat is null)
            return ApiResult<bool>.Failure(["Chat topilmadi."], 404);

        var receipt = await _context.ChatReadReceipts
            .FirstOrDefaultAsync(r => r.UserId == userId && r.ChatId == chatId);

        if (receipt is null)
        {
            receipt = new Core.Entities.ChatReadReceipt
            {
                UserId = userId,
                ChatId = chatId,
                LastReadAt = DateTime.UtcNow
            };
            _context.ChatReadReceipts.Add(receipt);
        }
        else
        {
            receipt.LastReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return ApiResult<bool>.Success(true);
    }

    public async Task<ApiResult<UnreadCountsDto>> GetUnreadCountsAsync(Guid userId)
    {
        var receipts = await _context.ChatReadReceipts
            .Where(r => r.UserId == userId)
            .ToDictionaryAsync(r => r.ChatId, r => r.LastReadAt);

        var globalChat = await _context.Chats.FirstOrDefaultAsync(c => c.Type == ChatType.Global);
        int globalCount = 0;
        if (globalChat is not null)
        {
            var lastRead = receipts.GetValueOrDefault(globalChat.Id, DateTime.MinValue);
            globalCount = await _context.ChatMessages
                .CountAsync(m => m.ChatId == globalChat.Id && m.SentAt > lastRead && m.SenderId != userId);
        }

        var projectChats = await _context.Chats
            .Where(c => c.Type == ChatType.Project && c.ProjectId != null)
            .ToListAsync();

        var projectChatCounts = new Dictionary<Guid, int>();
        foreach (var pc in projectChats)
        {
            var lastRead = receipts.GetValueOrDefault(pc.Id, DateTime.MinValue);
            var count = await _context.ChatMessages
                .CountAsync(m => m.ChatId == pc.Id && m.SentAt > lastRead && m.SenderId != userId);
            if (count > 0)
                projectChatCounts[pc.ProjectId!.Value] = count;
        }

        return ApiResult<UnreadCountsDto>.Success(new UnreadCountsDto
        {
            GlobalChatCount = globalCount,
            ProjectChatCounts = projectChatCounts
        });
    }
}
