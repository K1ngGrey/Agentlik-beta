import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiResult } from "@/types/api"
import type {
  ChatMessageDto,
  EditMessageRequest,
  SendMessageRequest,
} from "@/types/chat"

const POLL_INTERVAL_MS = 4000

export const chatKeys = {
  global: ["chat", "global"] as const,
  project: (projectId: string) => ["chat", "project", projectId] as const,
}

// --- API functions ---

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

export function editMessage(
  messageId: string,
  body: EditMessageRequest
): Promise<ApiResult<ChatMessageDto>> {
  return apiClient.put<ChatMessageDto>(`/api/messages/${messageId}`, body)
}

export function deleteMessage(
  messageId: string
): Promise<ApiResult<boolean>> {
  return apiClient.del<boolean>(`/api/messages/${messageId}`)
}

export function togglePinMessage(
  messageId: string
): Promise<ApiResult<ChatMessageDto>> {
  return apiClient.patch<ChatMessageDto>(`/api/messages/${messageId}/pin`, {})
}

// --- TanStack Query hooks ---

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.global }),
  })
}

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.project(projectId) }),
  })
}

export function useEditMessage(chatKey: readonly string[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      editMessage(id, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKey }),
  })
}

export function useDeleteMessage(chatKey: readonly string[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKey }),
  })
}

export function useTogglePinMessage(chatKey: readonly string[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => togglePinMessage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKey }),
  })
}
