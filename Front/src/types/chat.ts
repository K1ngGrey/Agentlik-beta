export interface ChatMessageDto {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  sentAt: string
  isPinned: boolean
  isEdited: boolean
  editedAt: string | null
  readByCount: number
  totalParticipants: number
}

export interface SendMessageRequest {
  content: string
}

export interface EditMessageRequest {
  content: string
}

export interface UnreadCountsDto {
  globalChatCount: number
  projectChatCounts: Record<string, number>
}
