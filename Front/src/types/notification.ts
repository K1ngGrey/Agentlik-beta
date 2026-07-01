export type NotificationType =
  | "StageStatusChanged"
  | "StageAssigned"
  | "NewChatMessage"
  | "DeadlineApproaching"

export interface NotificationDto {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedProjectId: string | null
  relatedStageId: string | null
  createdAt: string
}
