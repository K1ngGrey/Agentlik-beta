import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type { NotificationDto } from "@/types/notification"

export const notificationKeys = {
  list: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
}

export function getNotifications(onlyUnread?: boolean): Promise<ApiResult<NotificationDto[]>> {
  const params = onlyUnread ? "?onlyUnread=true" : ""
  return apiClient.get<NotificationDto[]>(`/api/notifications${params}`)
}

export function getUnreadNotificationCount(): Promise<ApiResult<number>> {
  return apiClient.get<number>("/api/notifications/unread-count")
}

export function markNotificationAsRead(id: string): Promise<ApiResult<boolean>> {
  return apiClient.post<boolean>(`/api/notifications/${id}/read`, {})
}

export function markAllNotificationsAsRead(): Promise<ApiResult<boolean>> {
  return apiClient.post<boolean>("/api/notifications/read-all", {})
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => getNotifications(),
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}
