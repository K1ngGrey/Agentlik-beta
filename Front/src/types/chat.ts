// Global va loyiha chatlaridagi xabar.
export interface ChatMessageDto {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  sentAt: string
}

// Xabar yuborish so'rovi (global va loyiha chati uchun bir xil).
export interface SendMessageRequest {
  content: string
}
