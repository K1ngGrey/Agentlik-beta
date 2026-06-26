import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type { ChatMessageDto, SendMessageRequest } from "@/types/chat"

// Polling oralig'i — yangi xabarlarni avtomatik tortib olish uchun (4s).
const POLL_INTERVAL_MS = 4000

// TanStack Query kesh kalitlari — global va har loyiha chati alohida.
export const chatKeys = {
  global: ["chat", "global"] as const,
  project: (projectId: string) => ["chat", "project", projectId] as const,
}

// --- Typed API funksiyalari ---

export function getGlobalMessages(): Promise<ApiResult<ChatMessageDto[]>> {
  return apiClient.get<ChatMessageDto[]>("/api/chats/global")
}

export function sendGlobalMessage(
  body: SendMessageRequest
): Promise<ApiResult<ChatMessageDto>> {
  return apiClient.post<ChatMessageDto>("/api/chats/global/messages", body)
}

export function getProjectMessages(
  projectId: string
): Promise<ApiResult<ChatMessageDto[]>> {
  return apiClient.get<ChatMessageDto[]>(`/api/projects/${projectId}/chat`)
}

export function sendProjectMessage(
  projectId: string,
  body: SendMessageRequest
): Promise<ApiResult<ChatMessageDto>> {
  return apiClient.post<ChatMessageDto>(
    `/api/projects/${projectId}/chat/messages`,
    body
  )
}

// --- TanStack Query hooklar ---

// Global chat — har ~4s da yangilanadi (polling).
export function useGlobalMessages() {
  return useQuery({
    queryKey: chatKeys.global,
    queryFn: getGlobalMessages,
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useSendGlobalMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => sendGlobalMessage({ content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.global })
    },
  })
}

// Loyiha chati — har ~4s da yangilanadi (polling).
export function useProjectMessages(projectId: string) {
  return useQuery({
    queryKey: chatKeys.project(projectId),
    queryFn: () => getProjectMessages(projectId),
    enabled: Boolean(projectId),
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useSendProjectMessage(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => sendProjectMessage(projectId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.project(projectId) })
    },
  })
}
